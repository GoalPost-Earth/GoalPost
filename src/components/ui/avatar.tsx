'use client'

import { getInitials } from '@/app/utils'
import type { GroupProps, SlotRecipeProps } from '@chakra-ui/react'
import { Avatar as ChakraAvatar, Group } from '@chakra-ui/react'
import * as React from 'react'

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement>

export interface AvatarProps extends ChakraAvatar.RootProps {
  name?: string
  src?: string
  srcSet?: string
  loading?: ImageProps['loading']
  icon?: React.ReactElement
  fallback?: React.ReactNode
  fontSize?: string
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  function Avatar(props, ref) {
    const {
      name,
      src,
      srcSet,
      loading,
      icon,
      fallback,
      fontSize,
      children,
      ...rest
    } = props
    return (
      <ChakraAvatar.Root ref={ref} {...rest}>
        <AvatarFallback name={name} icon={icon} fontSize={fontSize}>
          {fallback}
        </AvatarFallback>
        <ChakraAvatar.Image src={src} srcSet={srcSet} loading={loading} />
        {children}
      </ChakraAvatar.Root>
    )
  }
)

interface AvatarFallbackProps extends ChakraAvatar.FallbackProps {
  name?: string
  icon?: React.ReactElement
  fontSize?: string
}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  function AvatarFallback(props, ref) {
    const { name, icon, children, fontSize, ...rest } = props
    return (
      <ChakraAvatar.Fallback
        ref={ref}
        fontSize={fontSize}
        fontWeight="bold"
        {...rest}
      >
        {children}
        {name != null && children == null && <>{getInitials(name)}</>}
        {name == null && children == null && (
          <ChakraAvatar.Icon asChild={!!icon}>{icon}</ChakraAvatar.Icon>
        )}
      </ChakraAvatar.Fallback>
    )
  }
)

interface AvatarGroupProps extends GroupProps, SlotRecipeProps<'avatar'> {}

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup(props, ref) {
    const { size, variant, borderless, ...rest } = props
    return (
      <ChakraAvatar.PropsProvider value={{ size, variant, borderless }}>
        <Group gap="0" spaceX="-3" ref={ref} {...rest} />
      </ChakraAvatar.PropsProvider>
    )
  }
)
