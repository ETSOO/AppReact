import { Button, ButtonGroup, Slider, Stack } from '@material-ui/core';
import React from 'react';
import AvatarEditor from 'react-avatar-editor';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import RotateRightIcon from '@material-ui/icons/RotateRight';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import ComputerIcon from '@material-ui/icons/Computer';
import DoneIcon from '@material-ui/icons/Done';
import { DataTypes } from '@etsoo/shared';
import pica from 'pica';

/**
 * User avatar editor to Blob helper
 */
export interface UserAvatarEditorToBlob {
    (
        canvas: HTMLCanvasElement,
        mimeType?: string,
        quality?: number
    ): Promise<Blob>;
}

/**
 * User avatar editor on done handler
 */
export interface UserAvatarEditorOnDoneHandler {
    (canvas: HTMLCanvasElement, toBlob: UserAvatarEditorToBlob): void;
}

/**
 * User avatar editor props
 */
export interface UserAvatarEditorProps {
    /**
     * Cropping border size
     */
    border?: number;

    /**
     * Image source
     */
    image?: string | File;

    /**
     * Labels
     */
    labels?: DataTypes.ReadonlyStringDictionary;

    /**
     * Max width to save
     */
    maxWidth?: number;

    /**
     * On done handler
     */
    onDone: UserAvatarEditorOnDoneHandler;

    /**
     * Return scaled result?
     */
    scaledResult?: boolean;

    /**
     * Width of the editor
     */
    width?: number;

    /**
     * Height of the editor
     */
    height?: number;
}

interface EditorState {
    scale: number;
    rotate: number;
}

const defaultState: EditorState = {
    scale: 1,
    rotate: 0
};

/**
 * User avatar editor
 * https://github.com/mosch/react-avatar-editor
 * @param props Props
 * @returns Component
 */
export function UserAvatarEditor(props: UserAvatarEditorProps) {
    // Destruct
    const {
        border = 30,
        image,
        labels = {},
        maxWidth,
        onDone,
        scaledResult = false,
        width = 200,
        height = 200
    } = props;

    // Container width
    const containerWidth = width + 2 * border + 44 + 4;

    // Calculated max width
    const maxWidthCalculated =
        maxWidth == null || maxWidth < 200 ? 3 * width : maxWidth;

    // Labels
    const labelUpload = labels.upload ?? 'Upload';
    const labelDone = labels.done ?? 'Done';
    const labelReset = labels.reset ?? 'Reset';
    const labelZoom = labels.zoom ?? 'Zoom';
    const labelRotateLeft = labels.rotateLeft ?? 'Rotate left 90°';
    const labelRotateRight = labels.rotateRight ?? 'Rotate right 90°';

    // Ref
    const ref = React.createRef<AvatarEditor>();

    // Preview image state
    const [previewImage, setPreviewImage] = React.useState(image);

    // Is ready state
    const [ready, setReady] = React.useState(false);

    // Editor states
    const [editorState, setEditorState] = React.useState(defaultState);

    // Handle zoom
    const handleZoom = (
        _event: Event,
        value: number | number[],
        _activeThumb: number
    ) => {
        const scale = typeof value === 'number' ? value : value[0];
        const newState = { ...editorState, scale };
        setEditorState(newState);
    };

    // Handle image load
    const handleLoad = () => {
        setReady(true);
    };

    // Handle file change
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files == null || files.length == 0) return;

        // Reset all settings
        handleReset();

        // Set new preview image
        setPreviewImage(files[0]);

        // Set ready state
        setReady(false);
    };

    // Handle reset
    const handleReset = () => {
        setEditorState({ ...defaultState });
    };

    // Handle rotate
    const handleRotate = (r: number) => {
        let rotate = editorState.rotate + r;
        if (rotate >= 360 || rotate <= -360) rotate = 0;

        const newState = { ...editorState, rotate };
        setEditorState(newState);
    };

    // Handle done
    const handleDone = () => {
        // Data
        var data = scaledResult
            ? ref.current?.getImageScaledToCanvas()
            : ref.current?.getImage();
        if (data == null) return;

        // pica
        const picaInstance = pica();

        // toBlob helper
        // Convenience method, similar to canvas.toBlob(), but with promise interface & polyfill for old browsers.
        const toBlob = (
            canvas: HTMLCanvasElement,
            mimeType: string = 'image/jpeg',
            quality: number = 1
        ) => {
            return picaInstance.toBlob(canvas, mimeType, quality);
        };

        if (data.width > maxWidthCalculated) {
            // Target height
            const heightCalculated = (height * maxWidthCalculated) / width;

            // Target
            const to = document.createElement('canvas');
            to.width = maxWidthCalculated;
            to.height = heightCalculated;

            // Large photo, resize it
            // https://github.com/nodeca/pica
            picaInstance
                .resize(data, to, {
                    unsharpAmount: 160,
                    unsharpRadius: 0.6,
                    unsharpThreshold: 1
                })
                .then((result) => onDone(result, toBlob));
        } else {
            onDone(data, toBlob);
        }
    };

    return (
        <Stack direction="column" spacing={0.5} width={containerWidth}>
            <Button
                variant="outlined"
                size="medium"
                component="label"
                startIcon={<ComputerIcon />}
                fullWidth
            >
                {labelUpload}
                <input
                    id="fileInput"
                    type="file"
                    accept="image/png, image/jpeg"
                    multiple={false}
                    hidden
                    onChange={handleFileChange}
                />
            </Button>
            <Stack direction="row" spacing={0.5}>
                <AvatarEditor
                    ref={ref}
                    border={border}
                    width={width}
                    height={height}
                    onLoadSuccess={handleLoad}
                    image={previewImage ?? ''}
                    scale={editorState.scale}
                    rotate={editorState.rotate}
                />
                <ButtonGroup
                    size="small"
                    orientation="vertical"
                    disabled={!ready}
                >
                    <Button
                        onClick={() => handleRotate(90)}
                        title={labelRotateRight}
                    >
                        <RotateRightIcon />
                    </Button>
                    <Button
                        onClick={() => handleRotate(-90)}
                        title={labelRotateLeft}
                    >
                        <RotateLeftIcon />
                    </Button>
                    <Button onClick={handleReset} title={labelReset}>
                        <ClearAllIcon />
                    </Button>
                </ButtonGroup>
            </Stack>
            <Slider
                title={labelZoom}
                disabled={!ready}
                min={1}
                max={5}
                step={0.01}
                value={editorState.scale}
                onChange={handleZoom}
            />
            <Button
                variant="contained"
                startIcon={<DoneIcon />}
                disabled={!ready}
                onClick={handleDone}
            >
                {labelDone}
            </Button>
        </Stack>
    );
}
