import * as ts from 'typescript';
import * as Lint from 'tslint';
import * as path from 'path'
import { ErrorTolerantWalker } from './utils/ErrorTolerantWalker';
import { ExtendedMetadata } from './utils/ExtendedMetadata';
const tsconfig = require('../../tsconfig.json')

enum TypeModule {
    EXTERNAL_MODULE = 'External module',
    IMPORT_MODULE = 'Imported'
}

enum MessageError {
    UPPER_LEVEL = 'upper-level module into non-root directory using a relative path. Please use an absolute path: ',
    INTO_DIRECTORY = 'lower-level module into non-root directory using an absolute path. Please use a relative path: ',
    ROOT_DIRECTORY = 'module into root directory using a relative path. Please use an absolute path: ',
}

const getErrortext = (typeModule: TypeModule, MessageError: MessageError): string => `${typeModule} ${MessageError}`

/**
 * Implementation of the no-relative-imports rule.
 */
export class Rule extends Lint.Rules.AbstractRule {

    public static metadata: ExtendedMetadata = {
        ruleName: 'no-relative-imports',
        type: 'maintainability',
        description: 'Do not use relative paths when importing external modules or ES6 import declarations',
        options: null,
        optionsDescription: '',
        typescriptOnly: true,
        issueClass: 'Ignored',
        issueType: 'Warning',
        severity: 'Low',
        level: 'Opportunity for Excellence',
        group: 'Clarity',
        commonWeaknessEnumeration: '710'
    };
    

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoRelativeImportsRuleWalker(sourceFile, this.getOptions()));
    }
}

class NoRelativeImportsRuleWalker extends ErrorTolerantWalker {
    protected visitNode(node: ts.Node): void {
        
        if (node.kind === ts.SyntaxKind.ExternalModuleReference) {
            const moduleExpression: ts.Expression = (<ts.ExternalModuleReference>node).expression;
            const { status, message } = this.isModuleExpressionValid(moduleExpression, TypeModule.EXTERNAL_MODULE)
            if (!status) {
                this.addFailureAt(node.getStart(), node.getWidth(), message + node.getText());
            }
        } else if (node.kind === ts.SyntaxKind.ImportDeclaration) {
            const moduleExpression: ts.Expression = (<ts.ImportDeclaration>node).moduleSpecifier;
            const { status, message } =  this.isModuleExpressionValid(moduleExpression, TypeModule.IMPORT_MODULE)
            if (!status) {
                this.addFailureAt(node.getStart(), node.getWidth(), message + node.getText());
            }
        }
        super.visitNode(node);
    }

    private isRelativePath(path: string): boolean {
        return path.substring(0, 2) === './'
    }

    private getBaseUrl() {
        return tsconfig.compilerOptions.baseUrl
    }

    private getCurrentFileDirectory():string {
        const fileName = this.getSourceFile().fileName
        const baseUrl = this.getBaseUrl()
        const projectPath = path.resolve(process.cwd(), baseUrl) + '/'
        const customSourcePathFile = fileName.replace(projectPath, '')
        return path.dirname(customSourcePathFile)
    }

    private isRootDirectory(): boolean {
        return this.getCurrentFileDirectory() === '.'
    }

    private isDescendent(module: string): boolean {
        return module.includes(this.getCurrentFileDirectory())
    }

    private isUseBeforeDirectory(module: string): boolean {
        const subText = module.substring(0, 2);
        return subText === '..'
    }

    private isModuleExpressionValid(expression: ts.Expression, typeModule: TypeModule): { status:boolean, message:string } {
        if (expression.kind === ts.SyntaxKind.StringLiteral) {
            const moduleName: ts.StringLiteral = <ts.StringLiteral>expression;
            const moduleNamePath = path.dirname(moduleName.text)
           
            if (this.isRootDirectory()) {
                return this.isRelativePath(moduleName.text) ? 
                { status: false, message: getErrortext(typeModule, MessageError.ROOT_DIRECTORY) } : 
                { status: true, message: '' }
            }

            if (!this.isRelativePath(moduleName.text) && this.isDescendent(moduleNamePath)) {
                return { status: false, message: getErrortext(typeModule, MessageError.INTO_DIRECTORY) }
            }

            if (this.isUseBeforeDirectory(moduleName.text)) {
                return { status: false, message: getErrortext(typeModule, MessageError.UPPER_LEVEL) };
            }
        }
        return { status: true, message: '' }
    }
}