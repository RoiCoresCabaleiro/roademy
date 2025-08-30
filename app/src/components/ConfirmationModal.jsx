import Portal from "./Portal";
import Button from "./ui/Button";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/Card";
import ErrorMessage from "./ErrorMessage";
import Input from "./ui/Input";

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  children,
  onCancel,
  onConfirm,
  isLoading,
}) {
  if (!isOpen) return null;
  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onCancel}
      >
        <Card className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 mb-4">{message}</p>
            {children}
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={onConfirm}
              loading={isLoading}
            >
              Confirmar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Portal>
  );
}
