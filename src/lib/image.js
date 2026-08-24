// Resizes and compresses an image file in the browser before it's sent to
// the backend as a base64 data URI. There's no object storage (S3 or
// similar) wired up yet -- see the backend's V12 migration comment -- so
// keeping the payload small here matters: an unresized phone photo can
// easily be 5-10MB, which would bloat the menu_items table badly.
export function resizeImageToDataUrl(file, maxDimension = 480, quality = 0.75) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
            reject(new Error("Please choose an image file."));
            return;
        }

        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Couldn't read that file."));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error("Couldn't load that image."));
            img.onload = () => {
                let { width, height } = img;
                if (width > height && width > maxDimension) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                } else if (height > maxDimension) {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}