import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// Create motion-enhanced versions of Shadcn components
const MotionTableRow = motion(TableRow)
const MotionTableCell = motion(TableCell)
const MotionTableHead = motion(TableHead)

interface Invoice {
    invoice: string
    paymentStatus: string
    totalAmount: string
    paymentMethod: string
}

const invoices: Invoice[] = [
    {
        invoice: "INV0 asdf as01",
        paymentStatus:
            "Paid asdf asdfasdfasdfa sdfasdfasdf asdfasdfasdfasdf asdfasdfsdfasdfasdf asdfasdfasdf fasdfasdf asdfasdfasdfasdf asdfasdfsdfasdfasdf asdfasdfasdf",
        totalAmount: "$250.00",
        paymentMethod:
            "Credit fasdfasdf asdfasdfasdfasdf asdfasdfsdfasdfasdf asdfasdfasdf fasdfasdf asdfasdfasdfasdf asdfasdfsdfasdfasdf asdfasdfasdfCard",
    },
    {
        invoice: "INV asdf a002",
        paymentStatus: "Pend fasdfasdf asdfasdfasdfasdf asdfasdfsdfasdfasdf asdfasdfasdfing",
        totalAmount: "$150.00",
        paymentMethod: "PayPal",
    },
    {
        invoice: "INV0 asdfa s03",
        paymentStatus: "Unfasdfasdf asdfasdfasdfasdf asdfasdfsdfasdfasdf asdfasdfasdfpaid",
        totalAmount: "$350.00",
        paymentMethod: "Bank Transfer",
    },
    {
        invoice: "INV0b asdfasdf 01",
        paymentStatus:
            "Paid asdf asdfasdfasdfa sdfasdfasdf asdfasdfasdfasdf asdfasdfsdfasdfasdf asdfasdfasdf fasdfasdf asdfasdfasdfasdf asdfasdfsdfasdfasdf asdfasdfasdf",
        totalAmount: "$250.00",
        paymentMethod:
            "Credit fasdfasdf asdfasdfasdfasdf asdfasdfsdfasdfasdf asdfasdfasdf fasdfasdf asdfasdfasdfasdf asdfasdfsdfasdfasdf asdfasdfasdfCard",
    },
    {
        invoice: "INV0asdfasdf 02",
        paymentStatus: "Pend fasdfasdf asdfasdfasdfasdf asdfasdfsdfasdfasdf asdfasdfasdfing",
        totalAmount: "$150.00",
        paymentMethod: "PayPal",
    },
    {
        invoice: "INasdfasV003",
        paymentStatus: "Unfasdfasdf asdfasdfasdfasdf asdfasdfsdfasdfasdf asdfasdfasdfpaid",
        totalAmount: "$350.00",
        paymentMethod: "Bank Transfer",
    },
    {
        invoice: "INVasgas001",
        paymentStatus:
            "Paid asdf asdfasdfasdfa sdfasdfasdf asdfasdfasdfasdf asdfasdfsdfasdfasdf asdfasdfasdf fasdfasdf asdfasdfasdfasdf asdfasdfsdfasdfasdf asdfasdfasdf",
        totalAmount: "$250.00",
        paymentMethod:
            "Credit fasdfasdf asdfasdfasdfasdf asdfasdfsdfasdfasdf asdfasdfasdf fasdfasdf asdfasdfasdfasdf asdfasdfsdfasdfasdf asdfasdfasdfCard",
    },
    {
        invoice: "INVasdf002",
        paymentStatus: "Pend fasdfasdf asdfasdfasdfasdf asdfasdfsdfasdfasdf asdfasdfasdfing",
        totalAmount: "$150.00",
        paymentMethod: "PayPal",
    },
    {
        invoice: "INV0asdf03",
        paymentStatus: "Unfasdfasdf asdfasdfasdfasdf asdfasdfsdfasdfasdf asdfasdfasdfpaid",
        totalAmount: "$350.00",
        paymentMethod: "Bank Transfer",
    },
    // ... other invoice entries
]

export function TableDemo() {
    const spring = { type: "spring", damping: 40, stiffness: 200 }
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

    const toggleRowExpansion = (invoiceId: string) => {
        setExpandedRows((prev) => ({
            ...prev,
            [invoiceId]: !prev[invoiceId],
        }))
    }

    return (
        <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
                <MotionTableRow layout transition={spring}>
                    <MotionTableHead layout transition={spring} className="w-[100px]">
                        Invoice
                    </MotionTableHead>
                    <MotionTableHead layout transition={spring}>Status</MotionTableHead>
                    <MotionTableHead layout transition={spring}>Method</MotionTableHead>
                    <MotionTableHead layout transition={spring} className="text-right">
                        Amount
                    </MotionTableHead>
                </MotionTableRow>
            </TableHeader>
            <AnimatePresence>
                <TableBody>
                    {invoices.map((invoice) => {
                        const isExpanded = expandedRows[invoice.invoice] ?? false
                        return (
                            <MotionTableRow
                                key={invoice.invoice}
                                layout
                                transition={spring}
                                exit={{ opacity: 0, maxHeight: 0 }}
                                onClick={() => toggleRowExpansion(invoice.invoice)}
                                className="cursor-pointer"
                            >
                                <MotionTableCell layout transition={spring} className="font-medium">
                                    <div
                                        className={`${isExpanded ? "whitespace-normal" : "truncate"
                                            } max-w-xs overflow-hidden`}
                                    >
                                        {invoice.invoice}
                                    </div>
                                </MotionTableCell>
                                <MotionTableCell layout transition={spring}>
                                    <div
                                        className={`${isExpanded ? "whitespace-normal" : "truncate"
                                            } max-w-xs overflow-hidden`}
                                    >
                                        {invoice.paymentStatus}
                                    </div>
                                </MotionTableCell>
                                <MotionTableCell
                                    layout
                                    transition={spring}
                                    className="bg-red-200"
                                >
                                    <div
                                        className={`${isExpanded ? "whitespace-normal" : "truncate"
                                            } max-w-xs overflow-hidden`}
                                    >
                                        {invoice.paymentMethod}
                                    </div>
                                </MotionTableCell>
                                <MotionTableCell layout transition={spring} className="text-right">
                                    <div
                                        className={`${isExpanded ? "whitespace-normal" : "truncate"
                                            } max-w-xs overflow-hidden`}
                                    >
                                        {invoice.totalAmount}
                                    </div>
                                </MotionTableCell>
                            </MotionTableRow>
                        )
                    })}
                </TableBody>
            </AnimatePresence>
            <TableFooter>
                <MotionTableRow layout transition={spring}>
                    <MotionTableCell layout transition={spring} colSpan={3}>
                        Total
                    </MotionTableCell>
                    <MotionTableCell layout transition={spring} className="text-right">
                        $2,500.00
                    </MotionTableCell>
                </MotionTableRow>
            </TableFooter>
        </Table>
    )
}
