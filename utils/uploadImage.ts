export const uploadImage = async (imageUri: string) => {
    const formData = new FormData();

    formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "photo.jpg",
    } as any);

    formData.append("upload_preset", "Viora-Product");

    const response = await fetch(
        `${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    const data = await response.json();

    console.log("Cloudinary Response:", data);

    return data.secure_url;
};