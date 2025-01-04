import { Avatar } from '.'

export default function PlaceHolderAvatar({
  name,
  ...rest
}: {
  name: string
  [key: string]: any
}) {
  return (
    <Avatar
      src={undefined}
      width={200}
      height={200}
      border={'10px solid white'}
      name={name}
      {...rest}
    />
  )
}
