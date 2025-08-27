import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
} from '@mui/material';
import { theme } from '../utils/theme';
import IssueAttachments from './IssueAttachments';

export default function IssueFormDialog({
  open,
  onClose,
  mode, // 'create' or 'edit'
  issue,
  onIssueChange,
  onSave,
  parts = [],
  selectedIssue = null,
}) {
  const isEditMode = mode === 'edit';
  const title = isEditMode
    ? `Edit Issue: ${selectedIssue?.issue_number}`
    : 'Create New Issue';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          width: '80vw',
          maxWidth: 'none',
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5">{title}</Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 0, height: '85vh', overflow: 'hidden' }}>
        <Grid container sx={{ height: '100%', width: '100%', m: 0 }}>
          {/* LEFT SIDE - 1/3 */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              p: 2,
              pr: 1.5,
              borderRight: '1px solid',
              borderColor: 'divider',
              width: '33.333%',
              maxWidth: '33.333%',
              flexBasis: '33.333%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ height: '100%', overflowY: 'auto', pr: 1 }}>
              <Stack spacing={2} sx={{ width: '100%' }}>
                {/* Basic Information */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Basic Information
                  </Typography>

                  <Stack spacing={1.5} sx={{ width: '100%' }}>
                    <TextField
                      label="Issue Title"
                      fullWidth
                      value={issue.title ?? ''}
                      onChange={(e) =>
                        onIssueChange({
                          ...issue,
                          title: e.target.value,
                        })
                      }
                      placeholder="Enter a concise, descriptive title"
                      required
                    />

                    <TextField
                      label="Description"
                      fullWidth
                      multiline
                      rows={2}
                      value={issue.description ?? ''}
                      onChange={(e) =>
                        onIssueChange({
                          ...issue,
                          description: e.target.value,
                        })
                      }
                      placeholder="Provide detailed information about the issue"
                    />

                    <FormControl fullWidth>
                      <InputLabel>Part Affected</InputLabel>
                      <Select
                        value={issue.part_id ?? ''}
                        label="Part Affected"
                        onChange={(e) =>
                          onIssueChange({
                            ...issue,
                            part_id:
                              e.target.value === '' ? '' : e.target.value,
                          })
                        }
                      >
                        <MenuItem value="">None</MenuItem>
                        {parts.map((part) => (
                          <MenuItem key={part.id} value={part.id}>
                            {part.seat_part_number} - {part.description}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </Box>

                {/* Issue Classification */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Issue Classification
                  </Typography>

                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <FormControl fullWidth required>
                        <InputLabel>Issue Type</InputLabel>
                        <Select
                          value={issue.issue_type ?? ''}
                          label="Issue Type"
                          onChange={(e) =>
                            onIssueChange({
                              ...issue,
                              issue_type: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="supplier">Supplier Issue</MenuItem>
                          <MenuItem value="manufacturing">
                            Manufacturing Issue
                          </MenuItem>
                          <MenuItem value="design">Design Issue</MenuItem>
                          <MenuItem value="quality">Quality Issue</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth required>
                        <InputLabel>Severity</InputLabel>
                        <Select
                          value={issue.severity ?? ''}
                          label="Severity"
                          onChange={(e) =>
                            onIssueChange({
                              ...issue,
                              severity: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="critical">Critical</MenuItem>
                          <MenuItem value="major">Major</MenuItem>
                          <MenuItem value="minor">Minor</MenuItem>
                          <MenuItem value="cosmetic">Cosmetic</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth required>
                        <InputLabel>Priority</InputLabel>
                        <Select
                          value={issue.priority ?? ''}
                          label="Priority"
                          onChange={(e) =>
                            onIssueChange({
                              ...issue,
                              priority: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="urgent">Urgent</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="low">Low</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>

                {/* Assignment & Responsibility */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Assignment & Responsibility
                  </Typography>

                  <Stack spacing={1.5} sx={{ width: '100%' }}>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <TextField
                          label="Reported By *"
                          fullWidth
                          value={issue.reported_by ?? ''}
                          onChange={(e) =>
                            onIssueChange({
                              ...issue,
                              reported_by: e.target.value,
                            })
                          }
                          placeholder="Reporting person"
                          required
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          label="Assigned To"
                          fullWidth
                          value={issue.assigned_to ?? ''}
                          onChange={(e) =>
                            onIssueChange({
                              ...issue,
                              assigned_to: e.target.value,
                            })
                          }
                          placeholder="Assigned person"
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      label="Supplier Name"
                      fullWidth
                      value={issue.supplier_name ?? ''}
                      onChange={(e) =>
                        onIssueChange({
                          ...issue,
                          supplier_name: e.target.value,
                        })
                      }
                      placeholder="If applicable, name of supplier involved"
                    />

                    <TextField
                      label="Feedback Due Date"
                      type="date"
                      fullWidth
                      value={issue.due_date ?? ''}
                      onChange={(e) =>
                        onIssueChange({
                          ...issue,
                          due_date: e.target.value,
                        })
                      }
                      InputLabelProps={{ shrink: true }}
                      helperText="Target Date"
                    />
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Grid>

          {/* RIGHT SIDE - 2/3 */}
          <Grid
            item
            xs={12}
            md={8}
            sx={{
              p: 2,
              pl: 1.5,
              width: '66.667%',
              maxWidth: '66.667%',
              flexBasis: '66.667%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ height: '100%', overflowY: 'auto', pl: 1 }}>
              <Stack spacing={2} sx={{ width: '100%' }}>
                {/* Root Cause Details */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Root Cause Details
                  </Typography>

                  <Stack spacing={1.5} sx={{ width: '100%' }}>
                    <TextField
                      label="Root Cause Analysis"
                      fullWidth
                      multiline
                      rows={3}
                      value={issue.root_cause ?? ''}
                      onChange={(e) =>
                        onIssueChange({
                          ...issue,
                          root_cause: e.target.value,
                        })
                      }
                      placeholder="Detailed analysis of the root cause"
                    />

                    <IssueAttachments
                      // label="Root Cause Attachments"
                      attachments={issue.root_cause_attachments ?? []}
                      onAttachmentsChange={(files) =>
                        onIssueChange({
                          ...issue,
                          root_cause_attachments: files,
                        })
                      }
                      maxFiles={3}
                    />
                    <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                      Countermeasure Details
                    </Typography>
                    <TextField
                      label="Countermeasure Action"
                      fullWidth
                      multiline
                      rows={3}
                      value={issue.corrective_action ?? ''}
                      onChange={(e) =>
                        onIssueChange({
                          ...issue,
                          corrective_action: e.target.value,
                        })
                      }
                      placeholder="Actions taken to correct the issue"
                    />

                    <IssueAttachments
                      // label="Countermeasure Attachments"
                      attachments={issue.countermeasure_attachments ?? []}
                      onAttachmentsChange={(files) =>
                        onIssueChange({
                          ...issue,
                          countermeasure_attachments: files,
                        })
                      }
                      maxFiles={3}
                    />
                  </Stack>
                </Box>

                {/* Timing & Tracking Information */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Timing & Tracking Information
                  </Typography>

                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={6}>
                      <FormControl
                        fullWidth
                        sx={{ minWidth: theme.forms.timingDropdownMinWidth }}
                      >
                        <InputLabel>Application Timing</InputLabel>
                        <Select
                          value={issue.application_timing ?? ''}
                          label="Application Timing"
                          onChange={(e) =>
                            onIssueChange({
                              ...issue,
                              application_timing: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="on_time">On Time</MenuItem>
                          <MenuItem value="early">Early</MenuItem>
                          <MenuItem value="late">Late</MenuItem>
                          <MenuItem value="tbd">TBD</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl
                        fullWidth
                        sx={{ minWidth: theme.forms.timingDropdownMinWidth }}
                      >
                        <InputLabel>C/M Confirmation</InputLabel>
                        <Select
                          value={issue.cm_confirmation ?? ''}
                          label="C/M Confirmation"
                          onChange={(e) =>
                            onIssueChange({
                              ...issue,
                              cm_confirmation: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="confirmed">Confirmed</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                          <MenuItem value="na">N/A</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl
                        fullWidth
                        sx={{ minWidth: theme.forms.timingDropdownMinWidth }}
                      >
                        <InputLabel>Limit Book</InputLabel>
                        <Select
                          value={issue.limit_book ?? ''}
                          label="Limit Book"
                          onChange={(e) =>
                            onIssueChange({
                              ...issue,
                              limit_book: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="within_limits">
                            Within Limits
                          </MenuItem>
                          <MenuItem value="outside_limits">
                            Outside Limits
                          </MenuItem>
                          <MenuItem value="tbd">TBD</MenuItem>
                          <MenuItem value="na">N/A</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="NARS/IMS Number"
                        fullWidth
                        value={issue.nars_ims_number ?? ''}
                        onChange={(e) =>
                          onIssueChange({
                            ...issue,
                            nars_ims_number: e.target.value,
                          })
                        }
                        placeholder="Reference number"
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Status & Resolution */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Status & Resolution
                  </Typography>

                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={6}>
                      <FormControl
                        fullWidth
                        sx={{ minWidth: theme.forms.timingDropdownMinWidth }}
                      >
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={issue.status ?? ''}
                          label="Status"
                          onChange={(e) =>
                            onIssueChange({
                              ...issue,
                              status: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="open">Open</MenuItem>
                          <MenuItem value="in_progress">In Progress</MenuItem>
                          <MenuItem value="resolved">Resolved</MenuItem>
                          <MenuItem value="closed">Closed</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Resolution Date"
                        type="date"
                        fullWidth
                        value={issue.resolution_date ?? ''}
                        onChange={(e) =>
                          onIssueChange({
                            ...issue,
                            resolution_date: e.target.value,
                          })
                        }
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12} sx={{ width: '100%' }}>
                      <TextField
                        label="Comments/Notes"
                        fullWidth
                        multiline
                        rows={5}
                        value={issue.comments ?? ''}
                        onChange={(e) =>
                          onIssueChange({
                            ...issue,
                            comments: e.target.value,
                          })
                        }
                        placeholder="Additional comments or notes about this issue"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSave}
          variant="contained"
          disabled={
            !issue.title ||
            !issue.reported_by ||
            !issue.issue_type ||
            !issue.severity ||
            !issue.priority
          }
        >
          {isEditMode ? 'Update Issue' : 'Create Issue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
