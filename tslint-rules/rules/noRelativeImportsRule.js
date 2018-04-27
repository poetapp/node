"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const Lint = require("tslint");
const path = require("path");
const ErrorTolerantWalker_1 = require("./utils/ErrorTolerantWalker");
const tsconfig = require('../../tsconfig.json');
var TypeModule;
(function (TypeModule) {
    TypeModule["EXTERNAL_MODULE"] = "External module";
    TypeModule["IMPORT_MODULE"] = "Imported";
})(TypeModule || (TypeModule = {}));
var MessageError;
(function (MessageError) {
    MessageError["UPPER_LEVEL"] = "upper-level module into non-root directory using a relative path. Please use an absolute path: ";
    MessageError["INTO_DIRECTORY"] = "lower-level module into non-root directory using an absolute path. Please use a relative path: ";
    MessageError["ROOT_DIRECTORY"] = "module into root directory using a relative path. Please use an absolute path: ";
})(MessageError || (MessageError = {}));
const getErrortext = (typeModule, MessageError) => `${typeModule} ${MessageError}`;
/**
 * Implementation of the no-relative-imports rule.
 */
class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile) {
        return this.applyWithWalker(new NoRelativeImportsRuleWalker(sourceFile, this.getOptions()));
    }
}
Rule.metadata = {
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
exports.Rule = Rule;
class NoRelativeImportsRuleWalker extends ErrorTolerantWalker_1.ErrorTolerantWalker {
    visitNode(node) {
        if (node.kind === ts.SyntaxKind.ExternalModuleReference) {
            const moduleExpression = node.expression;
            const { status, message } = this.isModuleExpressionValid(moduleExpression, TypeModule.EXTERNAL_MODULE);
            if (!status) {
                this.addFailureAt(node.getStart(), node.getWidth(), message + node.getText());
            }
        }
        else if (node.kind === ts.SyntaxKind.ImportDeclaration) {
            const moduleExpression = node.moduleSpecifier;
            const { status, message } = this.isModuleExpressionValid(moduleExpression, TypeModule.IMPORT_MODULE);
            if (!status) {
                this.addFailureAt(node.getStart(), node.getWidth(), message + node.getText());
            }
        }
        super.visitNode(node);
    }
    isRelativePath(path) {
        return path.substring(0, 2) === './';
    }
    getBaseUrl() {
        return tsconfig.compilerOptions.baseUrl;
    }
    getCurrentFileDirectory() {
        const fileName = this.getSourceFile().fileName;
        const baseUrl = this.getBaseUrl();
        const projectPath = path.resolve(process.cwd(), baseUrl) + '/';
        const customSourcePathFile = fileName.replace(projectPath, '');
        return path.dirname(customSourcePathFile);
    }
    isRootDirectory() {
        return this.getCurrentFileDirectory() === '.';
    }
    isDescendent(module) {
        return module.includes(this.getCurrentFileDirectory());
    }
    isUseBeforeDirectory(module) {
        const subText = module.substring(0, 2);
        return subText === '..';
    }
    isModuleExpressionValid(expression, typeModule) {
        if (expression.kind === ts.SyntaxKind.StringLiteral) {
            const moduleName = expression;
            const moduleNamePath = path.dirname(moduleName.text);
            if (this.isRootDirectory()) {
                return this.isRelativePath(moduleName.text) ?
                    { status: false, message: getErrortext(typeModule, MessageError.ROOT_DIRECTORY) } :
                    { status: true, message: '' };
            }
            if (!this.isRelativePath(moduleName.text) && this.isDescendent(moduleNamePath)) {
                return { status: false, message: getErrortext(typeModule, MessageError.INTO_DIRECTORY) };
            }
            if (this.isUseBeforeDirectory(moduleName.text)) {
                return { status: false, message: getErrortext(typeModule, MessageError.UPPER_LEVEL) };
            }
        }
        return { status: true, message: '' };
    }
}
