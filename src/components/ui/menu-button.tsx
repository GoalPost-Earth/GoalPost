'use client'

import React from 'react'
import { Box, Button, Icon, Text, ButtonProps, HStack } from '@chakra-ui/react'
import Link from 'next/link'
import { ChurchOptions, useApp } from '@/app/AppContext'

type MenuButtonProps = {
  icon: JSX.Element
  color: string
  subColor?: string
  title: string
  link: string
  id: string
  subtitle: string
} & ButtonProps

const MenuButton: React.FC<MenuButtonProps> = ({
  icon,
  color,
  subColor,
  title,
  subtitle,
  link,
  id,
  ...rest
}) => {
  const { setChurch } = useApp()

  return (
    <Link href={link}>
      <Button
        width="100%"
        paddingY="40px"
        marginBottom="10px"
        size="lg"
        variant="surface"
        colorPalette="gray"
        boxShadow="md"
        borderRadius={15}
        justifyContent="flex-start"
        overflow="clip"
        onClick={() =>
          setChurch({
            name: title,
            level: subtitle.toLowerCase() as ChurchOptions,
            id,
          })
        }
        {...rest}
      >
        <Box>
          <HStack>
            <Icon w={10} h={10} color={color} margin="0px 20px 0 0px">
              {icon}
            </Icon>
            <Box textAlign="start">
              <Text fontSize="1xl" marginBottom={0} color={color}>
                {title}
              </Text>
              <Text fontSize="xs" fontWeight="normal" color={subColor}>
                {subtitle}
              </Text>
            </Box>
          </HStack>
        </Box>
      </Button>
    </Link>
  )
}

export default MenuButton
