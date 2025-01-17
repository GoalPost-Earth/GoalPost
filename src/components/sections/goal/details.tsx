'use client'

import { useApp } from '@/app/contexts'
import { CREATE_CAREPOINT_MUTATION } from '@/app/graphql'
import { CarePointFormData, carePointSchema } from '@/app/schema'
import {
  Button,
  DialogActionTrigger,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  EditButton,
  EntityDetail,
  NativeSelect,
  Textarea,
  toaster,
} from '@/components'
import { EntityEnum, STATUS_SELECT_OPTIONS } from '@/constants'
import { Goal } from '@/gql/graphql'
import { useMutation } from '@apollo/client'
import { DialogFooter, HStack, Spacer, VStack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

export default function GoalDetails({ goal }: { goal: Goal }) {
  const { user } = useApp()
  const [open, setOpen] = useState(false)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const {
    handleSubmit,
    register,
    control,
    formState: { isSubmitting, errors },
  } = useForm<CarePointFormData>({
    resolver: zodResolver(carePointSchema),
  })
  const router = useRouter()
  const [CreateCarePoint] = useMutation(CREATE_CAREPOINT_MUTATION)

  const onSubmit = async (data: CarePointFormData) => {
    try {
      const response = await CreateCarePoint({
        variables: {
          input: {
            ...data,
            enabledByGoals: {
              connect: [{ where: { node: { id_IN: data.enabledByGoals } } }],
            },
            caresForGoals: {
              connect: [{ where: { node: { id_IN: data.caresForGoals } } }],
            },
            createdBy: {
              connect: [{ where: { node: { authId_EQ: user?.sub } } }],
            },
          },
        },
      })

      if (!response.data) {
        throw new Error('Error creating care point')
      }

      router.push(
        `/carepoint/${response.data.createCarePoints.carePoints[0].id}`
      )

      setOpen(false)
      toaster.success({
        title: 'Success',
        description: 'Care Point generated successfully',
      })
    } catch (error) {
      console.error('🚀 ~ file: details.tsx:68 ~ error:', error)
    }
  }

  return (
    <>
      <DialogRoot
        placement="center"
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
      >
        <DialogBackdrop />
        <DialogTrigger asChild>
          <EditButton
            colorPalette={EntityEnum.Goal.toLowerCase()}
            text="Generate Care Point"
            mb={5}
          />
        </DialogTrigger>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent ref={contentRef}>
            <DialogHeader>
              <DialogTitle>Generate Care Point</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Textarea
                name="description"
                label="Description"
                control={control}
                errors={errors}
                required
              />
              <NativeSelect
                name="status"
                label="Status"
                register={register}
                errors={errors}
                options={STATUS_SELECT_OPTIONS}
              />
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button colorPalette="gray" variant="subtle">
                  Cancel
                </Button>
              </DialogActionTrigger>
              <Button
                type="submit"
                variant="subtle"
                loading={isSubmitting}
                onClick={handleSubmit(onSubmit)}
              >
                Generate
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </DialogContent>
        </form>
      </DialogRoot>

      <VStack
        key="Details"
        p={4}
        bg={'gray.contrast'}
        borderRadius={'2xl'}
        boxShadow={'xs'}
        alignItems={'flex-start'}
        width={{ lg: '70%' }}
      >
        <HStack width="100%" justifyContent="space-between">
          <Spacer />
          <Link href={`/goal/update/${goal.id}/details`}>
            <EditButton
              colorPalette="goal"
              size="xl"
              text="Edit Goal Details"
            />
          </Link>
        </HStack>
        <VStack gap={4}>
          <EntityDetail
            title="Description"
            entityName={goal.name}
            details={goal.description}
          />
          <EntityDetail title="Location" details={goal.location} />
          <EntityDetail title="Time" details={goal.time} />
          <EntityDetail title="Status" details={goal.status} />
        </VStack>
      </VStack>
    </>
  )
}
