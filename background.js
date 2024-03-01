

function googleTextToSpeech(text, callback) {
    // Google Text-to-Speech API integration
    // Replace 'YOUR_GOOGLE_API_KEY' with your actual API key
    const apiKey = 'AIzaSyCsP96Gu6TOaLkHcHmEiQDmgNOvfer0hgc'; #don't worry, this key is disabled so
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
    const data = {
        input: { text: text },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
    };

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => callback(data))
    .catch(error => console.error('Error:', error));
}

function openAISummarize(text, callback) {
    const apiKey = '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';
    const url = 'https://api.openai.com/v1/chat/completions';

    const data = {
        model: "gpt-4-1106-preview", 
        messages: [{
            role: "system",
            content: "You are a helpful assistant."
        },{
            role: "user",
            content: `Please summarize this for me: ${text}`
        }]
    };

    fetch(url, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
            const lastMessage = data.choices[0].message.content;
            callback(lastMessage);
        } else {
            console.error('Unexpected response structure:', data);
            callback('Error: Unexpected response structure');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        callback('Error: ' + error.message);
    });
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'textToSpeech') {
        googleTextToSpeech(request.text, sendResponse);
    } else if (request.type === 'summarizeText') {
        openAISummarize(request.text, sendResponse);
    }
    return true; // Keeps the message channel open for asynchronous response
});
// Existing background.js code...

// Assuming openai is already initialized with your API key
function openAIAssistant(text, callback) {
    // Step 1: Create an Assistant
    const { OpenAI } = require('openai');
    const openai = new OpenAI('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');
    const url = 'https://api.openai.com/v1/assistants';

    openai.beta.assistants.create({
        name: "Custom Assistant",
        instructions: "Provide information based on the user's query.",
        tools: [{ type: "code_interpreter" }],
        model: "gpt-4-1106-preview"
    })
    .then(assistant => {
        // Step 2: Create a Thread
        return openai.beta.threads.create().then(thread => ({ thread, assistant }));
    })
    .then(({ thread, assistant }) => {
        // Step 3: Add a Message to a Thread
        return openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: text
        }).then(message => ({ thread, assistant }));
    })
    .then(({ thread, assistant }) => {
        // Step 4: Run the Assistant
        return openai.beta.threads.runs.create(thread.id, {
            assistant_id: assistant.id
        });
    })
    .then(run => {
        // Step 5: Check the Run status
        // For simplicity, directly retrieving the messages without checking run status
        return openai.beta.threads.messages.list(thread.id);
    })
    .then(messages => {
        // Step 6: Display the Assistant's Response
        const assistantResponses = messages.data.filter(msg => msg.role === 'assistant');
        const responseText = assistantResponses.map(msg => msg.content.text.value).join('\n');
        callback(responseText);
    })
    .catch (error => {
        console.error('Error with OpenAI Assistant:', error);
        callback('Error: ' + error.message);
        });
        }

// Add a listener for the new "assistantSearch" message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
if (request.type === 'assistantSearch') {
openAIAssistant(request.text, sendResponse);
}
return true; // Keep the message channel open for async response
});



// Add a listener for the new "assistantSearch" message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'assistantSearch') {
        openAIAssistant(request.text, sendResponse);
    }
    return true; // Keep the message channel open for async response
});
