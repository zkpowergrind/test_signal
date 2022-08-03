import styled from "@emotion/styled"
import React, { FC } from "react"
import { Layout } from "../../../Constants"

const Parent = styled.div`
  text-align: right;
  width: ${Layout.keyWidth}px;
  border-right: 1px solid ${({ theme }) => theme.dividerColor};
  padding-right: 0.3em;
  box-sizing: border-box;
`

const Values = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const Value = styled.div`
  padding: 0.3em;
  font-size: 90%;
  color: ${({ theme }) => theme.secondaryTextColor};

  &:hover {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
    cursor: default;
  }
`

export interface GraphAxisProps {
  values: number[]
  valueFormatter?: (value: number) => string
  onClick: (value: number) => void
}

export const GraphAxis: FC<GraphAxisProps> = React.memo(
  ({ values, valueFormatter = (v: number) => v.toString(), onClick }) => {
    return (
      <Parent>
        <Values>
          {values
            .slice()
            .reverse()
            .map((value) => (
              <Value
                key={value}
                className="AxisValue"
                onClick={() => onClick(value)}
              >
                {valueFormatter(value)}
              </Value>
            ))}
        </Values>
      </Parent>
    )
  }
)
