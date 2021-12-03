import * as React from 'react';
import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import SelectTemplateController from './SelectTemplateController';
import LoadPhotosController from './LoadPhotosController';
import LoadScreenshotsController from './LoadScreenshotsController';
import CircularProgress from '@mui/material/CircularProgress';
import { TemplateTypeEnum } from '../helpers/enums';
import { downloadBlob, dataToReport, blobToDataURL } from './../utils/BlobHelper';

const BINARY_DATA_URL_PREFIX = "data:binary/octet-stream;base64,";
const APPLICATION_DATA_URL_PREFIX = "data:application/octet-stream;base64,";
const IMAGE_DATA_URL_PREFIX = "data:image/png;base64,";

const steps = ['選擇文件樣板', '依順序載入模型截圖', '依順序載入現場照片'];

const useStyles = makeStyles((theme) => ({
    promptMessage: {
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'column'
    }
}));

const DEFAULT_DATA = {
    template: {
        templateTypeEnum: TemplateTypeEnum.DEFAULT,
        templateFile: undefined,
        isFailed: false,
        message: undefined
    }, screenshots: {
        screenshotFiles: [],
        isFailed: false,
        message: undefined
    }, photos: {
        photoFiles: [],
        isFailed: false,
        message: undefined
    }
};

const StepperController = () => {
    const classes = useStyles();
    const [activeStep, setActiveStep] = React.useState(0);
    const [skipped, setSkipped] = React.useState(new Set());
    const [promptMessage, setPromptMessage] = React.useState();
    const [isGeneratingReport, setIsGeneratingReport] = React.useState(false);
    const [isGeneratingReportFailed, setIsGeneratingReportFailed] = React.useState(false);
    const [data, setData] = React.useState(DEFAULT_DATA);

    const updateTemplateData = (templateFileEnum, templateFile, isFailed, message) => {
        setData({
            ...data, template: {
                templateTypeEnum: templateFileEnum,
                templateFile: templateFile,
                isFailed: isFailed,
                message: message
            }
        });
    }

    const updateScreenshotsData = (screenshotFiles, isFailed, message) => {
        setData({
            ...data, screenshots: {
                screenshotFiles: screenshotFiles,
                isFailed: isFailed,
                message: message
            }
        });
    }

    const updatePhotosData = (photoFiles, isFailed, message) => {
        setData({
            ...data, photos: {
                photoFiles: photoFiles,
                isFailed: isFailed,
                message: message
            }
        });
    }

    const isStepFailed = (step) => {
        let result = undefined;
        if (step === 0) {
            result = data.template.isFailed;
        } else if (step === 1) {
            result = data.screenshots.isFailed;
        } else if (step === 2) {
            result = data.photos.isFailed;
        } else {
            result = false;
        }
        return result;
    };
    const getMessage = (step) => {
        let message = "";
        if (step === 0) {
            message = data.template.message;
        } else if (step === 1) {
            message = data.screenshots.message;
        } else if (step === 2) {
            message = data.photos.message;
        }
        return message;
    }

    const isMessageShown = (step) => {
        let result = false;
        if (getMessage(step)) {
            result = true;
        }
        return result;
    }

    const isStepOptional = (step) => {
        return false; //step === 1;
    };

    const isStepSkipped = (step) => {
        return skipped.has(step);
    };

    const handleNext = () => {
        let newSkipped = skipped;
        if (isStepSkipped(activeStep)) {
            newSkipped = new Set(newSkipped.values());
            newSkipped.delete(activeStep);
        }
        setSkipped(newSkipped);

        if (activeStep == 2) { //Validation before generate report
            //console.log(data);
            if (data.template.isFailed == true) {
                setPromptMessage(
                    <Typography className={classes.promptMessage} variant="caption" color="error">
                        樣板錯誤導致無法製作報告
                    </Typography>
                );
            } else if (data.screenshots.screenshotFiles.length == 0 || data.photos.photoFiles.length == 0) {
                setPromptMessage(
                    <Typography className={classes.promptMessage} variant="caption" color="error">
                        至少須包含一張模型截圖與照片
                    </Typography>
                );
            } else if (data.screenshots.screenshotFiles.length != data.photos.photoFiles.length) {
                setPromptMessage(
                    <Typography className={classes.promptMessage} variant="caption" color="error">
                        模型截圖與照片需有相同的數量
                    </Typography>
                );
            } else {
                //pass validation, move to report generation
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
                setIsGeneratingReport(true);
                generateReport();
            }
        } else {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleSkip = () => {
        if (!isStepOptional(activeStep)) {
            // You probably want to guard against something like this,
            // it should never occur unless someone's actively trying to break something.
            throw new Error("You can't skip a step that isn't optional.");
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped((prevSkipped) => {
            const newSkipped = new Set(prevSkipped.values());
            newSkipped.add(activeStep);
            return newSkipped;
        });
    };

    const getStep = (index) => {
        let step = (<Box></Box>);
        if (index == 0) {
            step = (<SelectTemplateController data={data.template} updateTemplateData={updateTemplateData} />);
        } else if (index == 1) {
            step = (<LoadScreenshotsController data={data.screenshots} updateScreenshotsData={updateScreenshotsData} />);
        } else if (index == 2) {
            step = (<LoadPhotosController data={data.photos} updatePhotosData={updatePhotosData} />);
        }
        return step;
    }

    const handleReset = () => {
        setActiveStep(0);
        setPromptMessage(undefined);
        setData(DEFAULT_DATA);
        setIsGeneratingReport(false);
        setIsGeneratingReportFailed(false);
    };

    const generateReport = async () => {
        const reader = new FileReader();
        reader.onload = async () => {
            let template = reader.result;
            let processedPairs = [];
            let screenshots = [];
            let photos = [];
            
            for(let screenshot of data.screenshots.screenshotFiles){
                let screenshotDataUrl = await Promise.resolve().then(r => blobToDataURL(screenshot));
                screenshots.push(screenshotDataUrl?.replace(BINARY_DATA_URL_PREFIX, IMAGE_DATA_URL_PREFIX)?.replace(APPLICATION_DATA_URL_PREFIX, IMAGE_DATA_URL_PREFIX));
            }

            for(let photo of data.photos.photoFiles){
                let photoDataUrl = await Promise.resolve().then(r => blobToDataURL(photo));
                photos.push(photoDataUrl?.replace(BINARY_DATA_URL_PREFIX, IMAGE_DATA_URL_PREFIX)?.replace(APPLICATION_DATA_URL_PREFIX, IMAGE_DATA_URL_PREFIX));
            }

            if(screenshots.length == photos.length){
                for(let i=0; i<screenshots.length; ++i){
                    processedPairs.push({screenshot: screenshots[i], photo: photos[i]});
                }
                console.log(processedPairs);

                try {
                    downloadBlob(
                        "report.docx",
                        await dataToReport(processedPairs, template),
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        () => { setIsGeneratingReport(false) }
                    );
                } catch (ex) {
                    console.log(ex);
                    setIsGeneratingReportFailed(true);
                }
            }
            
        };
        let templateFile;;
        if (data.template.templateTypeEnum == TemplateTypeEnum.LOCAL) {
            templateFile = data.template.templateFile;
        } else {
            templateFile = await fetch(`${process.env.PUBLIC_URL}/template.docx`).then(r => r.blob());
        }
        reader.readAsArrayBuffer(templateFile);
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Stepper activeStep={activeStep} style={{ minHeight: '45px' }}>
                {steps.map((label, index) => {
                    const stepProps = {};
                    const labelProps = {};
                    if (isStepOptional(index)) {
                        labelProps.optional = (
                            <Typography variant="caption">Optional</Typography>
                        );
                    }

                    if (isMessageShown(index)) {
                        labelProps.optional = (
                            <Typography variant="caption">{getMessage(index)}</Typography>
                        );
                    }

                    if (isStepSkipped(index)) {
                        stepProps.completed = false;
                    }

                    if (isStepFailed(index)) {
                        labelProps.optional = (
                            <Typography variant="caption" color="error">
                                {getMessage(index)}
                            </Typography>
                        );
                        labelProps.error = true;
                    }

                    return (
                        <Step key={label} {...stepProps}>
                            <StepLabel {...labelProps}>{label}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
            {activeStep === steps.length ? (
                //all steps finished
                <React.Fragment>
                    {
                        isGeneratingReport ? !isGeneratingReportFailed ? (
                            <Typography sx={{ mt: 2, mb: 1 }}>
                                正在製作文件，製作完成後文件將自動下載
                                <CircularProgress size={20} sx={{ marginLeft: '5px' }} />
                            </Typography>)
                            : (<Typography sx={{ mt: 2, mb: 1 }} color="error">製作文件時發生不可預期的錯誤，請確認是否使用正確的文件樣板。</Typography>)
                            : (<Typography sx={{ mt: 2, mb: 1 }}>已完成製作文件！</Typography>)
                    }
                    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                        <Box sx={{ flex: '1 1 auto' }} />
                        <Button onClick={handleReset}>再次製作</Button>
                    </Box>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <Box mt={3}>
                        {getStep(activeStep)}
                    </Box>
                    {/* control strip */}
                    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                        <Button
                            color="inherit"
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            sx={{ mr: 1 }}
                        >
                            上一步
                        </Button>
                        <Box sx={{ flex: '1 1 auto' }} />
                        {/* {isStepOptional(activeStep) && (
                            <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                                Skip
                            </Button>
                        )} */}
                        {promptMessage}
                        <Button onClick={handleNext}>
                            {activeStep === steps.length - 1 ? '製作文件' : '下一步'}
                        </Button>
                    </Box>
                </React.Fragment>
            )}
        </Box>
    );
}

export default StepperController;