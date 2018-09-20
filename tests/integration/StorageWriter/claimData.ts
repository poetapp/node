export const allAsciiCharactersClaim = {
	"id":"af7b4ecbd1d719226b5b420190d8928cf6245d86470cc81ccda5801e5040f658",
	"publicKey":"024cd0fe4c33231ca7c1d76f6fe00689f5872bcd4bc5557ab4cd2c5691b49c25a3",
	"signature":"3045022100d43b1430af16311c36505604b0b721e1f7717a7673681f605c0137ae657ce3f102203e6ef5c743abcfc2fe0829cdfc7a06c4341ce74f18cca37b1ce678b3c089c821",
	"type":"Work",
	"created":"2018-09-13T23:26:06.715Z",
	"attributes": {
		"name":"Test",
		"author":"Test",
		"content":"no problem mann!"
	}
}

export const nonAsciiCharactersClaim = {
	"id":"ee1a2255076cdbfefeb52c9981d2e128b0c284675d6e1e46bfc30c2831d3ef44",
	"publicKey":"024cd0fe4c33231ca7c1d76f6fe00689f5872bcd4bc5557ab4cd2c5691b49c25a3",
	"signature":"3044022050b05539e206f30ce24ea1cd3e66e2c1dd10fdfcb8f3523624e3c8b6b23092e902205ffcfdc4617995145160cfa717f415e1bfadd10276538a3b20333fc461c0147d",
	"type":"Work",
	"created":"2018-09-14T18:43:18.100Z",
	"attributes":{
		"name":"Test",
		"author":"Test stüff",
		"content":"these chars: öüäüüüüäüüüüßßä'üüßüääöüäööäääääßüüüßüüäüöüößüüöüüäöääüäööüüüüääüüüäöüäääöüü are causing me problem"
	}
}

export const longWithNonAsciiCharactersClaim = {
	"id": "323dbaf02cf4fc4deab4a85aa31921c6f4afba0817a710656016c95cddd3668f",
	"publicKey": "024cd0fe4c33231ca7c1d76f6fe00689f5872bcd4bc5557ab4cd2c5691b49c25a3",
	"signature": "304402203340ef3998d78f1956e24528164a623f3addabe9eeba06a9bbfa7e6442006f0e022019a98f0b77cf38f926545f22e8b00c4e21e1ca789455aebf3a68a823efd38bc5",
	"type": "Work",
	"created": "2018-09-17T20:43:02.643Z",
	"attributes": {
		"name": "Long Claim With Non-Ascii Characters",
		"author": "Test stüff",
		"content": "\n    English\n    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n    \n    German\n    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed tempor und Vitalität, so dass die Arbeit und die Trauer, einige wichtige Dinge eiusmod zu tun. Im Laufe der Jahre werde ich kommen, der aliquip nostrud wird aus ihr den Vorteil der Übung, so dass Stimulus Anstrengungen, wenn der Schulbezirk und Langlebigkeit. Möchten Sie einen Schmerz im cupidatat cillum sein hat in der Duis et dolore magna fliehen kritisiert wurde produziert keine resultierende Freude. Excepteur cupidatat Schwarzen sind nicht excepteur, ist die Seele beruhigen, das heißt, sie die allgemeinen Aufgaben von denen verlassen, die für Ihre Mühen schuld sind.\n\n    Spanish\n    Lorem ipsum dolor sit amet, elit adipiscing del consectetur, tempor sed y vitalidad, por lo que el trabajo y dolor, algunas cosas importantes que hacer eiusmod. Con los años, entraré, que nostrud aliquip fuera de ella la ventaja de ejercicio, por lo que los esfuerzos de estímulo si el distrito escolar y la longevidad. ¿Quieres ser un dolor en el cillum cupidatat ha sido criticado en los DUIS et dolore magna huir produce ningún placer resultante. Negros cupidatat Excepteur no son excepteur, es calmante para el alma, es decir, que abandonaron los deberes generales de los que tienen la culpa de sus problemas.\n"
	}
}