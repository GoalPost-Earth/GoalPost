'use client'

import React, { useState, useRef, ChangeEventHandler } from 'react'
import {
  Button,
  Center,
  Container,
  Input,
  Spinner,
  Fieldset,
} from '@chakra-ui/react'
import { UseFormSetValue } from 'react-hook-form'
import { ReactHookFormComponentProps } from '../../types/form'
import { Avatar } from '../ui'
import { useApp } from '@/app/contexts'

export interface ImageUploadProps extends ReactHookFormComponentProps {
  uploadPreset: string
  tags?: 'facial-recognition'
  initialValue?: string
  loading?: boolean

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>
}

const ImageUpload = (props: ImageUploadProps) => {
  const {
    label,
    name,
    uploadPreset,
    tags,
    setValue,
    // control,
    errors,
    ...rest
  } = props
  const cloudinaryAccount = 'goalpost-app'
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const { user } = useApp()

  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState(
    props.control._defaultValues['photo'] || undefined
  )

  const uploadImage: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = e.target.files ?? []
    const date = new Date().toISOString().slice(0, 10)
    const username = `${user?.name?.toLowerCase()}}`
    let filename = `${username}-${user?.id}/${date}_${files[0].name}`
    filename = filename.replace(/\s/g, '-')
    filename = filename.replace(/~/g, '-')
    filename = filename.replace(/[^a-zA-Z0-9-_]/g, '')

    const data = new FormData()
    data.append('file', files[0])
    data.append('upload_preset', uploadPreset || '')
    data.append('public_id', filename)

    data.append('tags', tags || '')

    setLoading(true)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryAccount}/image/upload`,
      {
        method: 'POST',
        body: data,
      }
    )
    const file = await res.json()

    setImage(file.secure_url)

    setValue(name, file.secure_url)
    setLoading(false)
  }

  return (
    <Fieldset.Root invalid={!!errors[name]}>
      {label ? (
        <Fieldset.Legend textAlign="center">{label}</Fieldset.Legend>
      ) : null}

      <Container padding={0} width="150px" height="150px" marginBottom={4}>
        <Center height="100%" borderRadius="md">
          {props.loading || loading ? (
            <Spinner data-testid="loading-spinner" color="grey" />
          ) : (
            <Avatar
              width={150}
              height={150}
              objectFit="cover"
              data-testid="image-loaded"
              src={image}
              rounded="full"
            />
          )}
        </Center>
      </Container>

      <Container padding={0} marginBottom={4} centerContent>
        <Input
          id={name}
          display="none"
          type="file"
          accept="image/png, image/webp, image/jpg, image/jpeg"
          {...rest}
          onChange={uploadImage}
          ref={fileInputRef}
        />
        <Button colorScheme="blue" onClick={handleButtonClick}>
          Upload Image
        </Button>
      </Container>

      {errors[name] && (
        <Fieldset.ErrorText>
          {errors[name]?.message as string}
        </Fieldset.ErrorText>
      )}
    </Fieldset.Root>
  )
}

export default ImageUpload
