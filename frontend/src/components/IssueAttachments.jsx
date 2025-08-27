import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import {
  AttachFile,
  Delete,
  Image,
  PictureAsPdf,
  Description,
  CloudUpload,
} from '@mui/icons-material';
import api from '../services/api';

const IssueAttachments = ({
  attachments,
  onAttachmentsChange,
  label,
  maxFiles = 5,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Get appropriate icon for file type
  const getFileIcon = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image color="primary" />;
      case 'pdf':
        return <PictureAsPdf color="error" />;
      case 'pptx':
      case 'ppt':
      case 'docx':
      case 'doc':
      case 'xlsx':
      case 'xls':
        return <Description color="info" />;
      default:
        return <AttachFile color="action" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (attachments.length + acceptedFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      setUploading(true);
      setError('');

      try {
        const uploadPromises = acceptedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);

          const response = await api.post('/uploads', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          return {
            id: Date.now() + Math.random(), // Temporary ID
            filename: file.name,
            size: file.size,
            url: response.data?.data?.url || response.data?.url,
            type: file.type,
          };
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        onAttachmentsChange([...attachments, ...uploadedFiles]);
      } catch (err) {
        console.error('Upload error:', err);
        setError('Failed to upload files. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [attachments, onAttachmentsChange, maxFiles]
  );

  const handleRemoveFile = (fileId) => {
    onAttachmentsChange(attachments.filter((file) => file.id !== fileId));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        ['.pptx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: true,
    disabled: uploading || attachments.length >= maxFiles,
  });

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>

      {/* Upload Area */}
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.400',
          borderRadius: 1,
          p: 1.5,
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          mb: 2,
          opacity: uploading ? 0.6 : 1,
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload
          sx={{
            fontSize: 24,
            color: isDragActive ? 'primary.main' : 'grey.500',
            mb: 0.5,
          }}
        />
        {uploading ? (
          <Typography variant="body2" color="text.secondary">
            Uploading...
          </Typography>
        ) : isDragActive ? (
          <Typography variant="body2" color="primary">
            Drop files here...
          </Typography>
        ) : (
          <Box>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Drag & drop or click
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Max {maxFiles} files
            </Typography>
          </Box>
        )}
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* File List */}
      {attachments.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {attachments.length} file{attachments.length !== 1 ? 's' : ''}{' '}
              attached
            </Typography>
            {attachments.length >= maxFiles && (
              <Chip
                label="Max files reached"
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Box>

          <List dense>
            {attachments.map((file) => (
              <ListItem
                key={file.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: 'background.paper',
                }}
              >
                <ListItemIcon>{getFileIcon(file.filename)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" noWrap>
                      {file.filename}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleRemoveFile(file.id)}
                    title="Remove file"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default IssueAttachments;
