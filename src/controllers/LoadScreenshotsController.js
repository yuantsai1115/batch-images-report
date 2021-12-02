import * as React from 'react';
import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useDropzone } from 'react-dropzone';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';


const useStyles = makeStyles((theme) => ({
    dropzone: ({ isDragActive, isDragReject, isDragAccept }) => ({
        width: '100%',
        backgroundColor: isDragAccept ? '#00e676' : (isDragReject ? '#ff1744' : '#00000000'),
        /* justifyContent: "center", */
        border: `2px dotted ${isDragActive ? '#047db8' : '#00000099'}`,
        padding: theme.spacing(1)
    }),
}));

const LoadScreenshotsController = () => {
    const classes = useStyles();

    const [files, setFiles] = React.useState([]);
    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        onDrop: acceptedFiles => {
            setFiles(acceptedFiles.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            })));
        }
    });


    return (
        <React.Fragment>
            <Card sx={{ minWidth: 275, marginBottom: '8px' }}>
                <CardContent>
                    <section className="container">
                        <div {...getRootProps({ className: classes.dropzone })}>
                            <input {...getInputProps()} />
                            <p>拖拉模型截圖至此，或點此選取多張模型截圖 (.jpeg或.png)</p>
                        </div>
                        <aside>
                            {/* <h4>模型截圖</h4> */}
                            {/* <ul>{files}</ul> */}
                        </aside>
                    </section>
                </CardContent>
            </Card>
            {
                files.length > 0 ? (
                    <Card sx={{ minWidth: 275 }}>
                        <CardContent>
                            <Stack
                                direction="column"
                                divider={<Divider orientation="horizontal" flexItem />}
                                spacing={2}
                            >
                                {
                                    files.map(file => (
                                        <Box key={file.name}>
                                            <img src={file.preview} style={{display: 'block', width: '300px', height: 'auto'}}/>
                                            <Typography variant="caption">{file.name}</Typography>
                                        </Box>
                                    ))
                                }
                            </Stack>
                        </CardContent>
                    </Card>
                ) : undefined
            }
        </React.Fragment>
    );
}

export default LoadScreenshotsController;