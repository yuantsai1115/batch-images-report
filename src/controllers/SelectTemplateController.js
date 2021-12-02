import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

const SelectTemplateController = () => {
    const [templateSource, setTemplateSource] = React.useState(0);
    const handleTemplateSourceChange = (event) => {
        setTemplateSource(event.target.value);
    };

    const [selectedFiles, setSelectedFiles] = React.useState([]);

    const handleFileSelected = (e) => {
        const files = Array.from(e.target.files);
        //[console.log("files:", files);
        setSelectedFiles(files);
    };
    return (
        <React.Fragment>
            <Card sx={{ minWidth: 275 }}>
                <CardContent>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">選擇預設樣板或自定義樣板來寫入圖片：</FormLabel>
                        <RadioGroup
                            aria-label="樣板"
                            name="controlled-radio-buttons-group"
                            value={templateSource}
                            onChange={handleTemplateSourceChange}
                        >
                            <FormControlLabel value={0} control={<Radio />} label="使用預設樣板" />
                            <FormControlLabel value={1} control={<Radio />} label="選擇自定義樣板 (.docx)" />
                        </RadioGroup>
                        {
                            templateSource == 1 ? (
                                <React.Fragment>

                                    <label htmlFor="contained-button-file">
                                        <input accept=".doc, .docx" style={{ display: 'none' }} id="contained-button-file" type="file" onChange={handleFileSelected} />
                                        <Button variant="contained" component="span" style={{marginRight: '8px'}}>
                                            選擇
                                        </Button>
                                        <Typography variant="caption" display="inline" gutterBottom>
                                            {selectedFiles && selectedFiles.length > 0 ? selectedFiles[0].name : null}
                                        </Typography>
                                    </label>
                                </React.Fragment>
                            ) : undefined
                        }
                    </FormControl>
                </CardContent>
            </Card>
        </React.Fragment>
    );
}

export default SelectTemplateController;