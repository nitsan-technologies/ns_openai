CKEDITOR.dialog.add("nsOpenAiContentDialog", function(editor) {
    let select_model = "text-davinci-003", select_temperature = 0.5, select_max_tokens = 4e3, select_amount = 1;
    const escapeHtml = (unsafe) => {
        return unsafe.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    };
    return {
        title: "OpenAI Content Assistance",
        minWidth: 400,
        minHeight: 70,
        contents: [
            {
                id: "ns-tab-basic",
                label: editor.lang.nsopenai_content.tabGeneral,
                accessKey: "C",
                elements: [
                    {
                        type: "textarea",
                        id: "ns-openai-prompt",
                        label: editor.lang.nsopenai_content.writeAbout,
                        rows: 6,
                        validate: CKEDITOR.dialog.validate.notEmpty(editor.lang.nsopenai_content.errorNotEmpty),
                        setup: function(element) {
                            this.setValue(element.getText());
                        },
                        commit: function(element) {
                            element.setText(" Loading … ");
                            var xhr = new XMLHttpRequest();
                            xhr.open("POST", "https://api.openai.com/v1/completions", true);
                            xhr.setRequestHeader("Content-Type", "application/json");
                            xhr.setRequestHeader("Authorization", "Bearer " + NS_OPENAI_KEY);                            
                            xhr.send(JSON.stringify({
                                prompt: this.getValue(),
                                // Text to complete
                                max_tokens: select_max_tokens,
                                // 1 to 4000
                                model: select_model,
                                // 'text-davinci-003', 'text-curie-001', 'text-babbage-001', 'text-ada-001'
                                temperature: select_temperature,
                                // 0.0 is equivalent to greedy sampling
                                top_p: 1,
                                // 1.0 is equivalent to greedy sampling
                                n: select_amount,
                                // Number of results to return
                                frequency_penalty: 0,
                                // 0.0 is equivalent to no penalty
                                presence_penalty: 0
                                // 0.0 is equivalent to no penalty
                            }));
                            xhr.onreadystatechange = function() {
                                if (this.readyState === 4) {
                                    if (this.status === 200) {
                                        let completeText = "", choices = JSON.parse(this.responseText).choices;
                                        for (let i = 0; i < choices.length; i++) {
                                            completeText += "<p>" + escapeHtml(choices[i].text) + "</p>";
                                        }
                                        element.setHtml(completeText);
                                    } else {
                                        element.setText(" Error: " + this.responseText);
                                    }
                                }
                            };
                            xhr.onerror = function() {
                                element.setText(" Error: " + this.responseText);
                            };
                        }
                    }
                ]
            },
            {
                id: "tab-advanced",
                label: editor.lang.nsopenai_content.tabAdvanced,
                elements: [
                    // Add select field with options to choose the model from openai api.
                    {
                        type: "select",
                        id: "model",
                        title: editor.lang.nsopenai_content.modelSelction,
                        label: editor.lang.nsopenai_content.modelSelctionLabel,
                        default: "text-davinci-003",
                        items: [
                            ["Davinci", "text-davinci-003"],
                            ["Curie", "text-curie-001"],
                            ["Babbage", "text-babbage-001"],
                            ["Ada", "text-ada-001"]
                        ],
                        setup: function(element) {
                            this.setValue(element.getText());
                        }
                    },
                    // Add select field with different temperatures from 0 to 2
                    {
                        type: "select",
                        id: "temperature",
                        title: editor.lang.nsopenai_content.temperature,
                        label: editor.lang.nsopenai_content.temperatureLabel,
                        default: 0.5,
                        items: [
                            ["0.0", 0.01],
                            ["0.25", 0.25],
                            ["0.5", 0.5],
                            ["0.75", 0.75],
                            ["1.0", 1],
                            ["1.25", 1.25],
                            ["1.5", 1.5],
                            ["1.75", 1.75],
                            ["2.0", 2]
                        ],
                        setup: function(element) {
                            element.setAttribute("type", "number");
                            this.setValue(element.getText());
                        },
                        commit: function(element) {
                        }
                    },
                    // Add select field for number of results
                    {
                        type: "select",
                        id: "amount",
                        title: editor.lang.nsopenai_content.amount,
                        label: editor.lang.nsopenai_content.amountLabel,
                        default: 1,
                        items: [
                            ["1", 1],
                            ["2", 2],
                            ["3", 3],
                            ["4", 4]
                        ],
                        setup: function(element) {
                            element.setAttribute("type", "number");
                            this.setValue(element.getText());
                        },
                        commit: function(element) {
                        }
                    }
                ]
            }
        ],
        onOk: function() {
            let dialog = this, nsopenai = editor.document.createElement("div");
            select_model = dialog.getValueOf("tab-advanced", "model");
            select_temperature = parseFloat(dialog.getValueOf("tab-advanced", "temperature"));
            select_amount = parseInt(dialog.getValueOf("tab-advanced", "amount"));
            switch (select_model) {
                case "text-davinci-003":
                    select_max_tokens = 4e3;
                    break;
                case "text-curie-001":
                    select_max_tokens = 2e3;
                    break;
                case "text-babbage-001":
                    select_max_tokens = 2e3;
                    break;
                case "text-ada-001":
                    select_max_tokens = 2e3;
                    break;
                default:
                    select_max_tokens = 4e3;
            }
            dialog.commitContent(nsopenai);
            editor.insertElement(nsopenai);
        }
    };
});
CKEDITOR.plugins.add("nsopenai_content", {
    icons: "ns-openai",
    lang: ["en", "de"],
    init: function(editor) {
        editor.addCommand("nsopenai_content", new CKEDITOR.dialogCommand("nsOpenAiContentDialog"));
        editor.ui.addButton("ns_openai", {
            label: "OpenAI Content Assistance",
            command: "nsopenai_content",
            toolbar: "insert",
            icon: this.path + "icons/ns-copywriter.png"
        });
    }
});
CKEDITOR.config.keystrokes = [
    [CKEDITOR.ALT + 67, "nsopenai_content"]
];
