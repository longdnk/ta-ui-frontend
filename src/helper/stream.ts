export const callStreamApi = async (data: any) => {
    try {
        const response = await fetch("http://127.0.0.1:5555/models/inference", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;
        // setChatParam({...chatParam, inputMessage: '', isRender: true});

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;

            if (value) {
                const chunk = decoder.decode(value);
                try {
                    console.log(chunk);
                    // result.current += chunk;
                    // setMessages(prev => updateMessageContent(prev, result.current));
                } catch (e) {
                    console.error("Error parsing JSON chunk:", e);
                }
            }
        }
        // setChatParam({...chatParam, inputMessage: '', isRender: false});
    } catch (error) {
        console.log(error)
    }
}