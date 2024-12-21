import * as React from 'react'

const ChatBotIcon: React.FC<React.SVGProps<SVGElement>> = ({
  color,
}: {
  color?: string
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="27"
    height="27"
    fill="none"
    viewBox="0 0 27 27"
  >
    <path
      stroke={color ?? '#E19E48'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M4.348 16.848a2.174 2.174 0 1 1 0-4.348M21.74 16.848a2.174 2.174 0 1 0 0-4.348"
    ></path>
    <path
      stroke={color ?? '#E19E48'}
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M7.609 7.609V4.348M18.478 7.609V4.348M7.609 4.348a1.087 1.087 0 1 0 0-2.174 1.087 1.087 0 0 0 0 2.174ZM18.478 4.348a1.087 1.087 0 1 0 0-2.174 1.087 1.087 0 0 0 0 2.174ZM14.674 7.609h-3.261c-3.075 0-4.612 0-5.567.988s-.955 2.578-.955 5.759c0 3.18 0 4.77.955 5.758s2.492.988 5.567.988h1.114c.86 0 1.164.178 1.757.823.656.715 1.671 1.668 2.59 1.89 1.306.315 1.452-.121 1.16-1.366-.082-.354-.29-.921-.071-1.251.122-.185.326-.23.733-.322.643-.143 1.173-.378 1.544-.762.956-.988.956-2.578.956-5.759 0-3.18 0-4.77-.956-5.758-.955-.988-2.492-.988-5.566-.988Z"
    ></path>
    <path
      stroke={color ?? '#E19E48'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M10.326 16.304c.62.66 1.606 1.087 2.718 1.087 1.11 0 2.097-.427 2.717-1.087"
    ></path>
    <path
      stroke={color ?? '#E19E48'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9.792 11.957h-.01M16.314 11.957h-.01"
    ></path>
  </svg>
)

export default ChatBotIcon
