"use client";

import { useState } from "react";
import { CalendarClock, Download, Loader2, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMedicalExamList } from "@/hooks/queries/useMedicalExam";
import { useDebounce } from "@/hooks/useDebounce";
import { MedicalExamListItem } from "@/interfaces/medical-exam";

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function MedicalExamListPage() {
  const [search, setSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState<string>("ALL");
  const [page, setPage] = useState(0);
  const [size] = useState(20);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useMedicalExamList({
    page,
    size,
    doctorId: doctorFilter !== "ALL" ? doctorFilter : undefined,
  });

  const exams = data?.content || [];
  const totalPages = data?.totalPages || 1;

  // Filter client-side for search (since mock doesn't support it)
  const filteredExams = exams.filter((exam: MedicalExamListItem) => {
    if (!debouncedSearch) return true;
    const term = debouncedSearch.toLowerCase();
    return (
      exam.patient.fullName.toLowerCase().includes(term) ||
      exam.doctor.fullName.toLowerCase().includes(term) ||
      exam.diagnosis?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Medical Examinations
          </h1>
          <p className="text-muted-foreground">
            View all medical examination records.
          </p>
        </div>
        <Button variant="outline" size="lg" className="rounded-lg">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card className="w-full shadow-sm">
        <CardHeader className="gap-3 sm:flex sm:items-end sm:justify-between">
          <div className="relative w-full sm:max-w-xl">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by patient, doctor, diagnosis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-lg pl-9"
            />
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Select
              value={doctorFilter}
              onValueChange={(v) => setDoctorFilter(v)}
            >
              <SelectTrigger className="h-10 w-full rounded-lg sm:w-48">
                <SelectValue placeholder="Filter by Doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Doctors</SelectItem>
                <SelectItem value="emp001">Dr. Nguyen Van Hung</SelectItem>
                <SelectItem value="emp002">Dr. Tran Thi Mai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-hidden rounded-b-xl border-t">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[20%]">Patient</TableHead>
                  <TableHead className="w-[20%]">Doctor</TableHead>
                  <TableHead className="w-[25%]">Diagnosis</TableHead>
                  <TableHead className="w-[15%]">Exam Date</TableHead>
                  <TableHead className="w-[10%] text-center">Rx</TableHead>
                  <TableHead className="w-[10%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center">
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading
                        exams...
                      </span>
                    </TableCell>
                  </TableRow>
                ) : filteredExams.length ? (
                  filteredExams.map((exam: MedicalExamListItem) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">
                        {exam.patient.fullName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {exam.doctor.fullName}
                      </TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-[200px]">
                        {exam.diagnosis || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(exam.examDate)}
                      </TableCell>
                      <TableCell className="text-center">
                        {exam.hasPrescription ? (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700"
                          >
                            💊
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full"
                          asChild
                        >
                          <Link href={`/admin/exams/${exam.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-muted-foreground"
                    >
                      <span className="inline-flex items-center gap-2 justify-center">
                        <CalendarClock className="h-4 w-4" /> No exams found
                      </span>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && data && data.totalElements > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-sm text-muted-foreground">
                Showing {page * size + 1}-
                {Math.min((page + 1) * size, data.totalElements)} of{" "}
                {data.totalElements}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
