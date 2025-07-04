import { isDomElementAvailable } from "./dom.mjs";

export function setupModifiers() {
    const modifiersBtn = document.getElementById('modifiers-btn');
    if (!isDomElementAvailable(modifiersBtn, HTMLButtonElement)) {
        throw new Error("dialog btn is not available");
    }

    const modifiersDialog = document.getElementById('modifiers-dialog');
    if (!isDomElementAvailable(modifiersDialog, HTMLDialogElement)) {
        throw new Error("dialog is not available");
    }

    const closeDialog = document.getElementById('close-dialog');
    if (!isDomElementAvailable(closeDialog, HTMLButtonElement)) {
        throw new Error("close dialog btn is not available");
    }
    const cancelDialog = document.getElementById('cancel-dialog');
    if (!isDomElementAvailable(cancelDialog, HTMLButtonElement)) {
        throw new Error("cancel dialog btn is not available");
    }

// Open dialog
    modifiersBtn.addEventListener('click', () => {
        modifiersDialog.showModal();
    });

// Close dialog
    [closeDialog, cancelDialog].forEach(btn => {
        btn.addEventListener('click', () => {
            modifiersDialog.close();
        });
    });

// Close on backdrop click
    modifiersDialog.addEventListener('click', (e) => {
        if (e.target === modifiersDialog) {
            modifiersDialog.close();
        }
    });

}

