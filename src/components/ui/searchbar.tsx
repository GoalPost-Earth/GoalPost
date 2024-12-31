import { Box, HStack, Input } from '@chakra-ui/react'
import { InputGroup } from './input-group'
import { SearchIcon } from '../icons'

function SearchBar({ ...props }) {
  return (
    <InputGroup endElement={<SearchIcon />} colorPalette={'brand'} {...props}>
      <Input placeholder="Search..." borderRadius={'full'} />
    </InputGroup>
  )
}

export default SearchBar
