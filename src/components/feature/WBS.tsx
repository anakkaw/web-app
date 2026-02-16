"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

type WBSItem = {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
};

export function WBS({
    items,
    onItemsChange,
    readOnly = false,
}: {
    items: WBSItem[];
    onItemsChange: (items: WBSItem[]) => void;
    readOnly?: boolean;
}) {
    const calculateTotal = (items: WBSItem[]) => {
        return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    };

    const grandTotal = calculateTotal(items);

    const updateItem = (
        itemId: string,
        field: keyof WBSItem,
        value: string | number
    ) => {
        if (readOnly) return;
        onItemsChange(
            items.map((item) => {
                if (item.id !== itemId) return item;
                return { ...item, [field]: value };
            })
        );
    };

    const deleteItem = (itemId: string) => {
        if (readOnly) return;
        if (!confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) return;
        onItemsChange(items.filter((item) => item.id !== itemId));
    };

    const addItem = () => {
        if (readOnly) return;
        const newItem: WBSItem = {
            id: Date.now().toString(),
            description: "รายการใหม่",
            quantity: 0,
            unit: "",
            unitPrice: 0,
        };
        onItemsChange([...items, newItem]);
    };

    const handleExportCSV = () => {
        const csvContent =
            "data:text/csv;charset=utf-8," +
            "รายการ,ปริมาณ,หน่วย,ราคาต่อหน่วย,ราคารวม\n" +
            items
                .map(
                    (item) =>
                        `${item.description},${item.quantity},${item.unit},${item.unitPrice},${item.quantity * item.unitPrice}`
                )
                .join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "wbs_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card className="w-full border-none shadow-xl rounded-2xl overflow-hidden card-premium ring-1 ring-white/50">
            <CardHeader className="bg-gradient-to-r from-stone-50 via-stone-100 to-stone-50 border-b border-stone-200 py-4 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                </div>
                <CardTitle className="flex items-center gap-3 text-stone-900 text-lg font-black tracking-tight relative z-10">
                    <div className="p-2 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/30 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                    </div>
                    รายละเอียดงบประมาณของโครงการ (BOQ)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="space-y-0">
                    <div className="relative w-full overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-stone-200 bg-[#fafaf9]">
                                    <th className="px-4 py-3 font-normal text-stone-500 uppercase tracking-wider text-xs w-12 text-center">#</th>
                                    <th className="px-4 py-3 font-normal text-stone-500 uppercase tracking-wider text-xs">รายการ</th>
                                    <th className="px-4 py-3 font-normal text-stone-500 uppercase tracking-wider text-xs text-right w-24">ปริมาณ</th>
                                    <th className="px-4 py-3 font-normal text-stone-500 uppercase tracking-wider text-xs text-center w-20">หน่วย</th>
                                    <th className="px-4 py-3 font-normal text-stone-500 uppercase tracking-wider text-xs text-right w-28">ราคา/หน่วย</th>
                                    <th className="px-4 py-3 font-normal text-stone-500 uppercase tracking-wider text-xs text-right w-36">รวม</th>
                                    <th className="px-4 py-3 w-10 text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-50">
                                {items.map((item, index) => (
                                    <tr key={item.id} className="group hover:bg-[#fff7ed] transition-all">
                                        <td className="px-2 py-1.5 text-center text-stone-400  text-xs">
                                            {index + 1}
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <div className="space-y-1">
                                                <Input
                                                    value={item.description}
                                                    onChange={(e) =>
                                                        updateItem(item.id, "description", e.target.value)
                                                    }
                                                    readOnly={readOnly}
                                                    className={`h-9 border-transparent bg-transparent ${!readOnly ? 'hover:bg-white hover:border-stone-200 focus:bg-white focus:border-orange-500' : ''} px-2 shadow-none transition-all text-stone-900 font-bold text-base`}
                                                    placeholder="ระบุรายการ..."
                                                />
                                                <div className="px-2">
                                                    <div className="h-1 w-full bg-[#e7e5e4] rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
                                                        <div
                                                            className="h-full bg-orange-600 shadow-[0_0_8px_rgba(234,88,12,0.4)] transition-all duration-500"
                                                            style={{ width: `${grandTotal > 0 ? ((item.quantity * item.unitPrice) / grandTotal) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <Input
                                                type="number"
                                                value={item.quantity === 0 ? '' : item.quantity}
                                                onChange={(e) =>
                                                    updateItem(
                                                        item.id,
                                                        "quantity",
                                                        e.target.value === '' ? 0 : parseFloat(e.target.value)
                                                    )
                                                }
                                                readOnly={readOnly}
                                                className={`h-9 text-right font-bold border-transparent bg-transparent ${!readOnly ? 'hover:bg-white hover:border-stone-200 focus:bg-white focus:border-orange-500' : ''} px-2 shadow-none transition-all text-stone-900 text-base`}
                                            />
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <Input
                                                value={item.unit}
                                                onChange={(e) =>
                                                    updateItem(item.id, "unit", e.target.value)
                                                }
                                                readOnly={readOnly}
                                                className={`h-9 text-center font-bold border-transparent bg-transparent ${!readOnly ? 'hover:bg-white hover:border-stone-200 focus:bg-white focus:border-orange-500' : ''} px-2 shadow-none transition-all text-stone-900 text-sm`}
                                                placeholder="-"
                                            />
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <Input
                                                type="number"
                                                value={item.unitPrice === 0 ? '' : item.unitPrice}
                                                onChange={(e) =>
                                                    updateItem(
                                                        item.id,
                                                        "unitPrice",
                                                        e.target.value === '' ? 0 : parseFloat(e.target.value)
                                                    )
                                                }
                                                readOnly={readOnly}
                                                className={`h-9 text-right font-bold border-transparent bg-transparent ${!readOnly ? 'hover:bg-white hover:border-stone-200 focus:bg-white focus:border-orange-500' : ''} px-2 shadow-none transition-all text-stone-900 text-base`}
                                            />
                                        </td>
                                        <td className="px-4 py-1.5 text-right font-black text-stone-600 text-base">
                                            ฿{(item.quantity * item.unitPrice).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            {!readOnly && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-stone-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all rounded-full"
                                                    onClick={() => deleteItem(item.id)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center text-stone-400 bg-[#fafaf9]">
                                            <p className="font-bold text-lg">ยังไม่มีรายการ</p>
                                            <p className="text-sm mt-1">{readOnly ? "ไม่มีรายการในโครงการนี้" : "กดปุ่ม \"+ เพิ่มรายการ\" เพื่อเริ่มบันทึกข้อมูล"}</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center p-6 bg-[#fafaf9] border-t border-stone-100">
                        <Button variant="ghost" size="sm" onClick={handleExportCSV} className="text-stone-500 font-bold hover:bg-stone-100 gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                            Export CSV
                        </Button>
                        {!readOnly && (
                            <Button
                                variant="default"
                                className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-[0_10px_15px_-3px_rgba(249,115,22,0.2)] font-black px-8 group"
                                onClick={addItem}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                เพิ่มรายการ
                            </Button>
                        )}
                    </div>
                </div>

                <div className="p-6 flex items-center justify-end bg-orange-600 border-t border-orange-700 shadow-[inset_0_4px_12px_rgba(0,0,0,0.1)]">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-orange-200 uppercase tracking-[0.3em] mb-1">งบประมาณโครงการสุทธิ</p>
                        <p className="text-4xl font-black text-white  drop-shadow-md">
                            ฿{grandTotal.toLocaleString()}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
