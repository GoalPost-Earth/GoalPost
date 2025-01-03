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
        borderWidth={1}
        borderColor={'brand.200'}
      />
    </InputGroup>
  )
}

export default SearchBar
