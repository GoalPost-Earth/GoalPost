import * as React from 'react'
import { Icon, IconProps } from '@chakra-ui/react'

const GoalPostIcon = ({ ...rest }: IconProps) => (
  <Icon {...rest} width="96px" height="24px">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="96"
      height="16"
      fill="none"
      viewBox="0 0 96 16"
    >
      <g filter="url(#filter0_i_448_1307)">
        <path
          fill="#FBD38D"
          d="M10.903 5.268a2 2 0 0 0-.306-.693 1.9 1.9 0 0 0-.522-.515 2.1 2.1 0 0 0-.716-.32 3.3 3.3 0 0 0-.887-.112q-1.044 0-1.783.5-.73.499-1.118 1.439-.38.94-.38 2.267 0 1.342.365 2.297.365.954 1.089 1.461.722.507 1.797.507.947 0 1.573-.276.635-.275.947-.783.314-.507.314-1.193l.716.075h-3.49V6.969h6.77v2.118q0 2.087-.887 3.572a5.9 5.9 0 0 1-2.43 2.267q-1.544.783-3.543.783-2.23 0-3.915-.947-1.686-.948-2.633-2.7-.94-1.752-.94-4.169Q.925 6 1.5 4.538q.582-1.463 1.61-2.469A6.8 6.8 0 0 1 5.49.54 8 8 0 0 1 8.382.018q1.358 0 2.52.388 1.172.381 2.066 1.089a5.7 5.7 0 0 1 1.455 1.663 5.3 5.3 0 0 1 .67 2.11zm11.881 10.44q-1.864 0-3.192-.738a5.1 5.1 0 0 1-2.035-2.073q-.71-1.335-.709-3.094 0-1.76.709-3.088a5 5 0 0 1 2.035-2.073q1.328-.746 3.192-.746t3.192.746a5 5 0 0 1 2.036 2.073q.708 1.327.708 3.088 0 1.76-.708 3.094a5.1 5.1 0 0 1-2.036 2.073q-1.328.74-3.192.739m.03-3.042q.522 0 .902-.35t.59-1 .208-1.543q0-.902-.209-1.544-.208-.649-.589-1a1.29 1.29 0 0 0-.902-.35q-.552 0-.947.35-.396.351-.604 1-.21.642-.209 1.544 0 .894.209 1.543.209.65.604 1t.947.35m10.769 3.013q-1.097 0-1.94-.358a2.9 2.9 0 0 1-1.312-1.104q-.477-.738-.477-1.879 0-.939.32-1.603.32-.672.895-1.097t1.335-.648a8 8 0 0 1 1.656-.291q.962-.075 1.543-.18.59-.111.85-.305a.64.64 0 0 0 .262-.53v-.03q0-.446-.344-.685t-.88-.239q-.589 0-.961.261-.365.254-.44.783H30.3q.075-1.044.664-1.924.597-.887 1.738-1.417 1.14-.537 2.848-.537 1.23 0 2.208.291.975.284 1.663.798.686.507 1.044 1.193.365.68.365 1.477V15.5h-3.848v-1.61h-.09a3.3 3.3 0 0 1-.835 1.036 3.1 3.1 0 0 1-1.11.574q-.62.18-1.365.179m1.342-2.595q.47 0 .88-.194.417-.195.678-.56t.261-.887v-.954q-.164.067-.35.126-.18.06-.388.112a10.122 10.122 0 0 1-.902.179q-.478.075-.783.246a1.16 1.16 0 0 0-.448.41q-.141.24-.141.537 0 .478.335.731.336.255.858.254M46.915.227V15.5h-4.117V.227zM48.951 15.5V.227h6.593q1.7 0 2.975.671a4.87 4.87 0 0 1 1.984 1.887q.708 1.216.708 2.841 0 1.64-.73 2.842-.724 1.2-2.037 1.85-1.304.648-3.05.648h-3.937V7.744h3.102q.73 0 1.245-.253.523-.26.798-.739.285-.477.284-1.126 0-.656-.284-1.118a1.78 1.78 0 0 0-.797-.716q-.516-.255-1.246-.254h-1.462V15.5zm19.113.209q-1.863 0-3.191-.739a5.1 5.1 0 0 1-2.036-2.073q-.71-1.335-.709-3.094 0-1.76.709-3.088a5 5 0 0 1 2.036-2.073q1.328-.746 3.191-.746 1.864 0 3.192.746a5 5 0 0 1 2.036 2.073q.708 1.327.708 3.088 0 1.76-.708 3.094a5.1 5.1 0 0 1-2.036 2.073q-1.328.74-3.192.739m.03-3.043q.523 0 .903-.35t.589-1 .209-1.543q0-.902-.21-1.544-.208-.649-.588-1a1.29 1.29 0 0 0-.903-.35q-.552 0-.947.35-.395.351-.604 1-.21.642-.209 1.544 0 .894.21 1.543.208.65.603 1 .396.35.947.35m18.047-4.892h-3.788a1.04 1.04 0 0 0-.246-.604 1.4 1.4 0 0 0-.56-.388 1.9 1.9 0 0 0-.745-.141q-.53 0-.91.194t-.373.551q-.007.255.216.47.231.216.888.336l2.326.417q1.76.321 2.618 1.082.866.753.872 2.02-.007 1.224-.73 2.126-.716.895-1.962 1.387-1.237.485-2.826.485-2.625 0-4.11-1.074-1.475-1.073-1.647-2.834h4.086q.082.545.537.843.464.29 1.164.29.567 0 .932-.193.372-.194.38-.552-.007-.329-.328-.522-.314-.195-.984-.313l-2.029-.358q-1.752-.306-2.625-1.164-.872-.857-.865-2.207-.007-1.193.627-2.021.64-.836 1.827-1.268 1.192-.44 2.826-.44 2.483 0 3.915 1.03 1.44 1.029 1.514 2.848m8.707-3.729v2.983h-7.547V4.045zm-6.086-2.744h4.117v10.515q0 .239.082.403.083.156.254.238.17.075.44.075.186 0 .432-.045.253-.045.373-.074l.596 2.893q-.275.082-.79.202-.506.119-1.208.156-1.417.075-2.379-.29-.962-.374-1.447-1.172t-.47-1.998z"
        ></path>
      </g>
      <defs>
        <filter
          id="filter0_i_448_1307"
          width="94.133"
          height="17.72"
          x="0.925"
          y="0.019"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          ></feBlend>
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          ></feColorMatrix>
          <feOffset dy="2"></feOffset>
          <feGaussianBlur stdDeviation="4"></feGaussianBlur>
          <feComposite
            in2="hardAlpha"
            k2="-1"
            k3="1"
            operator="arithmetic"
          ></feComposite>
          <feColorMatrix values="0 0 0 0 0.752941 0 0 0 0 0.337255 0 0 0 0 0.129412 0 0 0 1 0"></feColorMatrix>
          <feBlend in2="shape" result="effect1_innerShadow_448_1307"></feBlend>
        </filter>
      </defs>
    </svg>
  </Icon>
)

export default GoalPostIcon
