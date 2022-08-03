import styled from "@emotion/styled"
import { ComponentProps, FC } from "react"

export const ToolbarButtonGroup = styled.div`
  min-width: auto;
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  align-items: center;
  cursor: pointer;
`

const _ToolbarButtonGroupItem = styled.button<{ selected?: boolean }>`
  outline: none;
  -webkit-appearance: none;
  min-width: auto;
  padding: 0 0.5rem;
  color: inherit;
  background: ${({ theme, selected }) =>
    selected ? theme.themeColor : "inherit"};
  text-transform: none;
  height: 2rem;
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  align-items: center;
  cursor: pointer;

  border: 1px solid ${({ theme }) => theme.dividerColor};
  border-radius: 4px;

  &:first-child {
    border-radius: 4px 0 0 4px;
  }

  &:last-child {
    border-radius: 0 4px 4px 0;
  }

  &:not(:last-child) {
    border-right: none;
  }

  &:hover {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
  }
`

export const ToolbarButtonGroupItem: FC<
  React.PropsWithChildren<
    Omit<ComponentProps<typeof _ToolbarButtonGroupItem>, "tabIndex">
  >
> = ({ children, ...props }) => (
  <_ToolbarButtonGroupItem
    {...props}
    onMouseDown={(e) => e.preventDefault()}
    tabIndex={-1}
  >
    {children}
  </_ToolbarButtonGroupItem>
)
