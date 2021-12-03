import createReport from 'docx-templates';

export const downloadBlob = (filename, content, mimeType, callback) => {
    const blob = new Blob([content], { type: mimeType });

    const URL = window.URL || window.webkitURL;
    const downloadURI = URL.createObjectURL(blob);

    let link = document.createElement('a');
    link.setAttribute('href', downloadURI);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    callback();
}

export const dataToReport = async (pairs, template) => {
    const report = await createReport({
        template,
        data: {
            pairs: pairs
        },
        // cmdDelimiter won't work for looping
        // cmdDelimiter: ['{', '}'],
    })
    return report;
}

export function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        var fr = new FileReader();
        fr.onload = (e) => {
            resolve(e.target.result);
        };
        fr.onerror = reject;
        fr.readAsDataURL(blob);
    });
}