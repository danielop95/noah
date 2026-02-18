'use client'

import { useMemo } from 'react'

import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export type UserOption = {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  image: string | null
  email: string | null
}

type UserMultiSelectProps = {
  label: string
  users: UserOption[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  excludeIds?: string[]
  disabled?: boolean
  error?: boolean
  helperText?: string
}

const UserMultiSelect = ({
  label,
  users,
  selectedIds,
  onChange,
  excludeIds = [],
  disabled,
  error,
  helperText
}: UserMultiSelectProps) => {
  const availableUsers = useMemo(() => users.filter(u => !excludeIds.includes(u.id)), [users, excludeIds])

  const selectedUsers = useMemo(() => users.filter(u => selectedIds.includes(u.id)), [users, selectedIds])

  const getDisplayName = (user: UserOption) =>
    user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Sin nombre'

  const getInitials = (user: UserOption) => {
    const name = getDisplayName(user)

    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Autocomplete
      multiple
      options={availableUsers}
      value={selectedUsers}
      onChange={(_, newValue) => onChange(newValue.map(u => u.id))}
      getOptionLabel={getDisplayName}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      disabled={disabled}
      renderInput={params => (
        <TextField {...params} label={label} placeholder='Buscar usuarios...' error={error} helperText={helperText} />
      )}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props

        return (
          <Box component='li' key={key} {...otherProps} className='flex items-center gap-3 p-2'>
            <Avatar src={option.image || undefined} sx={{ width: 32, height: 32 }}>
              {getInitials(option)}
            </Avatar>
            <Box>
              <Typography variant='body2'>{getDisplayName(option)}</Typography>
              <Typography variant='caption' color='textSecondary'>
                {option.email}
              </Typography>
            </Box>
          </Box>
        )
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index })

          return (
            <Chip
              key={key}
              {...tagProps}
              avatar={
                <Avatar src={option.image || undefined} sx={{ width: 24, height: 24 }}>
                  {getInitials(option)}
                </Avatar>
              }
              label={getDisplayName(option)}
              size='small'
            />
          )
        })
      }
    />
  )
}

export default UserMultiSelect
