import {
  FormControl,
  FormLabel,
  Textarea,
  Text,
  HStack,
  IconButton,
} from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RepeatIcon } from '@chakra-ui/icons'

type EditorProps = {
  label: string
  value: string
  onChange: (value: string) => void
  onDebouncedChange?: (value: string) => void
  debounceMs?: number
  placeholder?: string
  rows?: number
  rightAction?: { label: string; onClick: () => void; isLoading?: boolean }
  autoFocus?: boolean
}

export default function Editor({
  label,
  value,
  onChange,
  onDebouncedChange,
  debounceMs = 800,
  placeholder,
  rows = 8,
  rightAction,
  autoFocus,
}: EditorProps) {
  const [internal, setInternal] = useState(value)
  const timer = useRef<number | null>(null)

  useEffect(() => setInternal(value), [value])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value
      setInternal(next)
      onChange(next)
      if (onDebouncedChange) {
        if (timer.current) window.clearTimeout(timer.current)
        timer.current = window.setTimeout(
          () => onDebouncedChange(next),
          debounceMs
        )
      }
    },
    [onChange, onDebouncedChange, debounceMs]
  )

  const count = internal.length

  return (
    <FormControl>
      <HStack justify='space-between' mb={2}>
        <FormLabel m={0}>{label}</FormLabel>
        <HStack spacing={2}>
          {rightAction && (
            <IconButton
              aria-label={rightAction.label}
              icon={<RepeatIcon />}
              size='sm'
              onClick={rightAction.onClick}
              isLoading={rightAction.isLoading}
              variant='ghost'
            />
          )}
          <Text fontSize='xs' color='whiteAlpha.700'>
            {count} chars
          </Text>
        </HStack>
      </HStack>
      <Textarea
        value={internal}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        resize='vertical'
        autoFocus={autoFocus}
        variant='filled'
        bg='whiteAlpha.100'
        _hover={{ bg: 'whiteAlpha.200' }}
        _focus={{ bg: 'whiteAlpha.200' }}
      />
    </FormControl>
  )
}
