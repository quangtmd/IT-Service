import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export const uploadFile = async (file: File, path: string = 'images'): Promise<string> => {
    if (!file) {
        throw new Error("No file provided for upload.");
    }
    const storageRef = ref(storage, `${path}/${Date.now()}-${file.name}`);
    
    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading file to Firebase Storage:", error);
        throw error;
    }
};

export const deleteFileByUrl = async (fileUrl: string): Promise<void> => {
    if (!fileUrl) {
        console.warn("No file URL provided for deletion.");
        return;
    }
    
    try {
        // Create a reference from the HTTPS URL
        const storageRef = ref(storage, fileUrl);
        await deleteObject(storageRef);
    } catch (error: any) {
        // It's common for this to fail if the file doesn't exist, which is often okay.
        if (error.code === 'storage/object-not-found') {
            console.warn(`File not found in Storage, but proceeding with DB deletion: ${fileUrl}`);
        } else {
            console.error("Error deleting file from Firebase Storage:", error);
            // We don't re-throw here to allow DB deletion to proceed even if storage deletion fails
        }
    }
};