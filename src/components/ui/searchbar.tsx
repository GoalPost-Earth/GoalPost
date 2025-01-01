import { Input } from '@chakra-ui/react'
import { InputGroup } from './input-group'
import { SearchIcon } from '../icons'

function SearchBar({ ...props }) {
  return (
    <InputGroup endElement={<SearchIcon />} colorPalette={'brand'} {...props}>
      <Input
        placeholder="Search..."
        borderRadius={'full'}
        bg={'gray.contrast'}
      />
    </InputGroup>
  )
}

export default SearchBar
