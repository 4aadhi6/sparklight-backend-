import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Printer, Download, ArrowLeft, CheckCircle } from "lucide-react";
import axios from "axios";
import { formatDate, formatCurrency } from "../utils/utils";
const API = import.meta.env.VITE_API_URL;

export const Invoice: React.FC = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(`${API}/api/bookings/my-bookings`);
        const currentBooking = res.data.find((b: any) => b._id === id);
        setBooking(currentBooking);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading)
    return <div className="pt-24 text-center">Loading Invoice...</div>;
  if (!booking)
    return <div className="pt-24 text-center">Invoice not found</div>;

  const totalAmount = 499; // Mock total amount
  const balanceDue = totalAmount - booking.advancePaid;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 no-print">
        <Link to="/dashboard">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft size={18} /> Back to Dashboard
          </Button>
        </Link>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer size={18} /> Print
          </Button>
          <Button className="gap-2">
            <Download size={18} /> Download PDF
          </Button>
        </div>
      </div>

      <Card className="p-8 md:p-12 shadow-2xl border-none bg-white dark:bg-zinc-900 print:shadow-none print:p-0">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                SPARK LIGHT
              </span>
            </div>
            <p className="text-zinc-500 text-sm">123 Service Lane, Tech City</p>
            <p className="text-zinc-500 text-sm">support@sparklight.com</p>
            <p className="text-zinc-500 text-sm">+1 (555) 000-1234</p>
          </div>
          <div className="text-left md:text-right">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
              Invoice
            </h1>
            <p className="text-zinc-500 font-medium">
              #{booking._id.slice(-8).toUpperCase()}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold uppercase">
              <CheckCircle size={14} /> Paid
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-12 py-8 border-y border-zinc-100 dark:border-zinc-800">
          <div>
            <p className="text-xs font-bold uppercase text-zinc-400 mb-2">
              Billed To
            </p>
            <p className="font-bold text-lg">{booking.userId?.name}</p>
            <p className="text-zinc-500 text-sm">{booking.userId?.phone}</p>
            <p className="text-zinc-500 text-sm mt-2 max-w-xs">
              {booking.address}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase text-zinc-400 mb-2">
              Invoice Details
            </p>
            <p className="text-sm">
              <span className="text-zinc-500">Date:</span>{" "}
              {formatDate(booking.date)}
            </p>
            <p className="text-sm">
              <span className="text-zinc-500">Service:</span>{" "}
              {booking.serviceType}
            </p>
            <p className="text-sm">
              <span className="text-zinc-500">Type:</span> {booking.type}
            </p>
          </div>
        </div>

        <table className="w-full mb-12">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800 text-left">
              <th className="py-4 text-xs font-bold uppercase text-zinc-400">
                Description
              </th>
              <th className="py-4 text-xs font-bold uppercase text-zinc-400 text-right">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-50 dark:border-zinc-900">
              <td className="py-6">
                <p className="font-bold">{booking.serviceType} Service</p>
                <p className="text-sm text-zinc-500">{booking.details}</p>
              </td>
              <td className="py-6 text-right font-medium">
                {formatCurrency(totalAmount)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-full md:w-64 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Advance Paid</span>
              <span className="font-medium text-green-600">
                -{formatCurrency(booking.advancePaid)}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-zinc-200 dark:border-zinc-700">
              <span className="font-bold text-lg">Balance Due</span>
              <span className="font-bold text-lg text-blue-600">
                {formatCurrency(balanceDue)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-zinc-400 text-sm italic">
            Thank you for choosing Spark Light. We appreciate your business!
          </p>
        </div>
      </Card>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .min-h-screen { padding-top: 0 !important; }
        }
      `}</style>
    </div>
  );
};
