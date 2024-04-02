const vscode = require("vscode");
const translate=require("./custom/translate");
function isEnglish(str) { 
	var reg=/[a-zA-Z]/g;
	return reg.test(str);
}
function toWordGroup(englishText) { 
	return englishText.split(" ")
			.map((word, index) => {
				if (index == 0) {
					return word.toLowerCase();
				} else {
					return (
						word.charAt(0).toUpperCase() +
						word.slice(1).toLowerCase()
					);
				}
			}).join('')
}

function toSentence(wordGroup) { 
	const isCamelCased = /^[a-z]+([A-Z]+[a-z]+)*$/
	const isUnderlineCased=/\_*([a-z]|[A-Z])+(\_+([a-z]|[A-Z])+)*$/
	if (isCamelCased.test(wordGroup)) {
		return wordGroup.replace(/([A-Z])/g, ' $1').toLowerCase();
	} else if (isUnderlineCased.test(wordGroup)) { 
		return wordGroup.replace(/_/g, " ").toLowerCase();
	}
}
function activate(context) {
    const disposable = vscode.commands.registerCommand(
        "variable-naming-conversion.variableNamingConversion",
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const selection = editor.selection;
			const selectedText=editor.document.getText(selection);
			if (!selectedText) { 
				vscode.window.showWarningMessage("No Code is selected");
				return
			}
            if (!isEnglish(selectedText)) {
				let translatedText=await translate(selectedText)
				try {
					if (translatedText) {
						editor.edit((editBuilder) => {
							let wordGroup = toWordGroup(translatedText)
								
							editBuilder.replace(
								selection,
								wordGroup
							);
						});
					} else {
						vscode.window.showErrorMessage(
							"Translation failed."
						);
					}
				} catch (error) {
					vscode.window.showErrorMessage(
						"Translation failed: " + error.message
					);
				}
			} else {
				let sentence = toSentence(selectedText)
				let translateText= await translate(sentence, 'en', 'zh')
				try {
					editor.edit((editBuilder) => {
						editBuilder.replace(
							selection,
							translateText
						)
					})
				} catch (error) {
					vscode.window.showErrorMessage(
						"Translation failed: " + error.message
					);
				}
            }
        }
    );

    context.subscriptions.push(disposable);
}
exports.activate = activate;
