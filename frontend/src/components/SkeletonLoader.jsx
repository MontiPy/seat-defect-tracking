import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { theme, commonStyles } from '../utils/theme';

// Card skeleton for management screens
export const CardSkeleton = ({ count = 3 }) => (
  <Box sx={commonStyles.managementGrid}>
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index} {...theme.cards.management}>
        <CardContent>
          <Stack spacing={2}>
            {/* Title */}
            <Skeleton
              variant="text"
              height={28}
              width="80%"
              sx={{ borderRadius: 1 }}
            />

            {/* Description */}
            <Stack spacing={1}>
              <Skeleton
                variant="text"
                height={16}
                width="100%"
                sx={{ borderRadius: 0.5 }}
              />
              <Skeleton
                variant="text"
                height={16}
                width="60%"
                sx={{ borderRadius: 0.5 }}
              />
            </Stack>

            {/* Action buttons */}
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Skeleton
                variant="rectangular"
                height={32}
                width={60}
                sx={{ borderRadius: 1 }}
              />
              <Skeleton
                variant="rectangular"
                height={32}
                width={70}
                sx={{ borderRadius: 1 }}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    ))}
  </Box>
);

// Project card skeleton
export const ProjectCardSkeleton = ({ count = 6 }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index} sx={{ width: 280, height: 320 }}>
        <CardContent>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <Skeleton variant="text" height={24} width="70%" />
            <Skeleton
              variant="rectangular"
              height={20}
              width={50}
              sx={{ borderRadius: 1 }}
            />
          </Stack>

          {/* Description */}
          <Stack spacing={0.5} sx={{ mb: 2 }}>
            <Skeleton variant="text" height={16} width="100%" />
            <Skeleton variant="text" height={16} width="80%" />
          </Stack>

          {/* Statistics section */}
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
            <Skeleton variant="text" height={16} width="60%" sx={{ mb: 1 }} />
            <Stack direction="row" spacing={2} justifyContent="space-around">
              {Array.from({ length: 3 }).map((_, i) => (
                <Box key={i} sx={{ textAlign: 'center' }}>
                  <Skeleton
                    variant="circular"
                    width={24}
                    height={24}
                    sx={{ mx: 'auto', mb: 0.5 }}
                  />
                  <Skeleton variant="text" height={12} width={40} />
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={1}>
            <Skeleton
              variant="rectangular"
              height={32}
              width={80}
              sx={{ borderRadius: 1 }}
            />
            <Skeleton
              variant="rectangular"
              height={32}
              width={60}
              sx={{ borderRadius: 1 }}
            />
          </Stack>
        </CardContent>
      </Card>
    ))}
  </Box>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 6 }) => (
  <TableContainer component={Paper} sx={commonStyles.tableContainer}>
    <Table>
      <TableHead>
        <TableRow>
          {Array.from({ length: columns }).map((_, index) => (
            <TableCell key={index}>
              <Skeleton variant="text" height={20} width="80%" />
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                {colIndex === 0 ? (
                  <Skeleton
                    variant="rectangular"
                    height={16}
                    width="60%"
                    sx={{ borderRadius: 0.5 }}
                  />
                ) : colIndex === columns - 1 ? (
                  <Stack direction="row" spacing={1}>
                    <Skeleton
                      variant="rectangular"
                      height={24}
                      width={24}
                      sx={{ borderRadius: 0.5 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      height={24}
                      width={24}
                      sx={{ borderRadius: 0.5 }}
                    />
                  </Stack>
                ) : (
                  <Skeleton
                    variant="text"
                    height={16}
                    width={Math.random() > 0.5 ? '80%' : '60%'}
                  />
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

// List skeleton for dialogs and forms
export const ListSkeleton = ({ items = 4 }) => (
  <Stack spacing={2}>
    {Array.from({ length: items }).map((_, index) => (
      <Box
        key={index}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Skeleton
          variant="rectangular"
          width={40}
          height={40}
          sx={{ borderRadius: 1 }}
        />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" height={20} width="70%" sx={{ mb: 0.5 }} />
          <Skeleton variant="text" height={16} width="50%" />
        </Box>
        <Skeleton
          variant="rectangular"
          width={24}
          height={24}
          sx={{ borderRadius: 0.5 }}
        />
      </Box>
    ))}
  </Stack>
);

// Stats cards skeleton
export const StatsCardsSkeleton = ({ count = 4 }) => (
  <Stack direction="row" spacing={2} sx={{ mb: 3, overflowX: 'auto' }}>
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index} sx={{ minWidth: 150, textAlign: 'center' }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Skeleton
            variant="text"
            height={40}
            width="60%"
            sx={{ mx: 'auto', mb: 1 }}
          />
          <Skeleton
            variant="text"
            height={16}
            width="80%"
            sx={{ mx: 'auto' }}
          />
        </CardContent>
      </Card>
    ))}
  </Stack>
);

// Form skeleton for dialogs
export const FormSkeleton = () => (
  <Stack spacing={3} sx={{ pt: 1 }}>
    <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
    <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
    <Stack direction="row" spacing={2}>
      <Skeleton
        variant="rectangular"
        height={56}
        sx={{ borderRadius: 1, flex: 1 }}
      />
      <Skeleton
        variant="rectangular"
        height={56}
        sx={{ borderRadius: 1, flex: 1 }}
      />
    </Stack>
    <Stack direction="row" spacing={2}>
      <Skeleton
        variant="rectangular"
        height={56}
        sx={{ borderRadius: 1, flex: 1 }}
      />
      <Skeleton
        variant="rectangular"
        height={56}
        sx={{ borderRadius: 1, flex: 1 }}
      />
    </Stack>
  </Stack>
);

export default {
  CardSkeleton,
  ProjectCardSkeleton,
  TableSkeleton,
  ListSkeleton,
  StatsCardsSkeleton,
  FormSkeleton,
};
