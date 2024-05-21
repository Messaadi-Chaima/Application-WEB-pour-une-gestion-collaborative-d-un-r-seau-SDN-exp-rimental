export const addConfiguration = (fileName, fileContent) => {
    return {
        type: 'ADD_CONFIGURATION',
        payload: {
            name: fileName,
            content: fileContent
        }
    };
};
