import { ref } from 'vue';
export type Toast = { id: number; title: string; message?: string; icon?: string };
class ToastBus {
  private _id = 0;
  public toasts = ref<Toast[]>([]);
  show(t: Omit<Toast, 'id'>) {
    const id = ++this._id;
    this.toasts.value.push({ id, ...t });
    setTimeout(() => this.dismiss(id), 4000);
  }
  dismiss(id: number) { this.toasts.value = this.toasts.value.filter(t => t.id !== id); }
}
export const toastBus = new ToastBus();
