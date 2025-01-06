import { Input, InputElementProps } from '@chakra-ui/react'
import { InputGroup } from './input-group'
import { ChangeEvent } from 'react'

function SearchBar({
  onChange,
  value,
  startElement,
  endElement,
  ...rest
}: {
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  value?: string
  startElement?: React.ReactNode
  endElement?: React.ReactNode
} & InputElementProps) {
  return (
    <InputGroup
      startElement={startElement}
      endElement={endElement}
      colorPalette={'brand'}
      {...rest}
    >
      <Input
        placeholder="Search..."
        borderRadius={'full'}
        bg={'gray.contrast'}
        borderWidth={1}
        borderColor={'brand.200'}
        value={value}
        onChange={(event) => onChange?.(event)}
      />
    </InputGroup>
  )
}

export default SearchBar
