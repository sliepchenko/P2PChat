const buttons = document.querySelectorAll('[data-copy-paste]');

Array.from(buttons).forEach((button) => {
    const attribute = button.dataset.copyPaste;

    if (attribute.startsWith('from:')) {
        const query = attribute.split('from:')[1];
        const element = document.querySelector(query);

        button.addEventListener('click', copy(element, attribute));
    }

    if (attribute.startsWith('to:')) {
        const query = attribute.split('to:')[1];
        const element = document.querySelector(query);

        button.addEventListener('click', paste(element, attribute));
    }
});

function copy(element, attribute) {
    return () => {
        navigator.clipboard.writeText(element.value);

        console.log(`CopyPaste: Copied from ${attribute}'`);
    }
}

function paste(element, attribute) {
    return async () => {
        element.value = element.innerText = await navigator.clipboard.readText();
        element.dispatchEvent(new Event('change'));

        console.log(`CopyPaste: Pasted to ${attribute}'`);
    }
}