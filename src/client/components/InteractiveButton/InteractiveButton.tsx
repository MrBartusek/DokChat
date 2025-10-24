import React from "react";
import { Button, ButtonProps, Spinner } from "react-bootstrap";
import { IconType } from "react-icons";

export interface InteractiveButtonProps extends ButtonProps {
  loading?: boolean;
  icon?: IconType;
  children?: React.ReactNode;
}

function InteractiveButton(props: InteractiveButtonProps) {
  const { loading, icon, disabled, children, ...buttonProps } = props;

  const spinner = (
    <Spinner
      as="span"
      animation="border"
      size="sm"
      role="status"
      aria-hidden="true"
      className="me-2"
    />
  );
  const iconEl = icon ? React.createElement(icon, { className: "me-2" }) : null;

  return (
    <Button disabled={disabled || loading} {...(buttonProps as any)}>
      {loading ? spinner : iconEl}
      {children}
    </Button>
  );
}

export default InteractiveButton;
