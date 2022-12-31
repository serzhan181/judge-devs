export const getBase64 = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (error) => reject(error);

    reader.onloadend = () => {
      // Use a regex to remove data url part
      if (reader.result) {
        const base64String = reader.result
          .toString()
          .replace(/^data:.+;base64,/, "");

        resolve(base64String);
      }
    };

    reader.readAsDataURL(file);
  });
