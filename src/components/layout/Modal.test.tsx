import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

const ModalHarness = ({ onClose }: { onClose: () => void }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)}>
        Open editor
      </button>
      <Modal
        title="Edit details"
        open={open}
        returnFocusRef={triggerRef}
        onClose={() => {
          setOpen(false);
          onClose();
        }}
      >
        <button type="button">Focusable content</button>
      </Modal>
    </>
  );
};

describe('Modal', () => {
  it('closes on Escape and restores focus to its trigger', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ModalHarness onClose={onClose} />);

    const trigger = screen.getByRole('button', { name: 'Open editor' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('open');

    await user.click(screen.getByRole('button', { name: 'Focusable content' }));
    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
    expect(dialog).not.toHaveAttribute('open');
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
