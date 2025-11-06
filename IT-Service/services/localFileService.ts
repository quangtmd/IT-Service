// Converts a File object to a base64 data URL
export const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

// This function is kept for compatibility but does nothing,
// as deleting a dataURL from localStorage is handled by the data service.
export const deleteFileByUrl = async (fileUrl: string): Promise<void> => {
    // No operation needed for local storage data URLs
    return Promise.resolve();
};
