"use client";

import { UserOverview } from "@/types";
import { useState, useMemo, useRef } from "react";
import { DownloadIcon, SearchIcon, XIcon } from "lucide-react";
import Button from "@/components/ui/button";
import Select from "@/components/ui/select";

const PAGE_SIZE = 25;

function membershipRowCSV(member: UserOverview): string {
  const parts = member.name.trim().split(" ");
  const lastName = parts.pop();
  const firstName = parts.join(" ");
  return [firstName, lastName, member.dob, member.address?.address, member.address?.postCode, member.email, member.createdAt].join(";");
}

function exportMembershipCSV(members: UserOverview[]) {
  const header = "Fornavn;Etternavn;Fødselsdato;Adresse;Postnummer;E-post;Betalingsdato\n"
  const content = header + members.map(membershipRowCSV).join("\n");
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "NKF_medlemsliste.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function stripDiacritics(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
}

export default function UserList({
  users,
  years,
}: {
  users: UserOverview[];
  years: number[];
}) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");

  const searchInputRef = useRef<HTMLInputElement>(null);

  const usersInYear = useMemo(() => users.filter(user =>
    selectedYear === null || user.yearsAsMember.includes(selectedYear)
  ), [users, selectedYear]);

  const filteredUsers = useMemo(() => usersInYear.filter(user =>
    stripDiacritics(search).split(" ").every(subSearch =>
      stripDiacritics(user.name).includes(subSearch)
    )
  ), [usersInYear, search]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-center gap-3">
        <label className="flex flex-col items-start gap-1">
          <span className="text-sm font-medium text-neutral-500">Medlemsår</span>
          <Select
            onChange={e => {
              setSelectedYear(e.target.value === "" ? null : parseInt(e.target.value));
              setPage(1);
            }}
            className="min-w-44"
          >
            <option value="">Ikke valgt år</option>
            {years.map(year => <option key={year}>{year}</option>)}
          </Select>
        </label>
        <Button
          onClick={() => {
            if (selectedYear === null) {
              alert("Ingen år er valgt");
              return;
            }
            exportMembershipCSV(usersInYear.filter(user => user.address !== null && parseInt(user.dob.substring(0, 4)) >= selectedYear - 26))
          }}
          disabled={selectedYear === null}
          variant="secondary"
        >
          <DownloadIcon className="h-4 w-4" />
          Eksporter medlemsliste
        </Button>
      </div>
      <div>
        Antall medlemmer: {selectedYear === null ? `${users.filter(user => user.isMember).length} / ${users.length}` : usersInYear.length}
      </div>
      <div className="relative w-full max-w-96 self-center">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        <input
          ref={searchInputRef}
          className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-11 transition-colors hover:border-neutral-500 focus:border-neutral-900 focus:outline-none"
          type="text"
          placeholder="Medlemssøk"
          autoComplete="off"
          onChange={e => {
            setSearch(e.target.value)
            setPage(1);
          }}
          value={search}
        />
        {search !== "" &&
          <button
            type="button"
            aria-label="Tøm søk"
            onClick={() => {
              setSearch("");
              setPage(1);
              searchInputRef.current?.focus();
            }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus-visible:bg-neutral-100 focus-visible:text-neutral-700"
          >
            <XIcon className="h-5 w-5" />
          </button>
        }
      </div>
      <div className="overflow-x-auto self-center-safe max-w-full sm:text-xl text-sm">
        <table>
          <thead>
            <tr>
              <th>Navn</th>
              <th>NKF ID</th>
              <th>WCA ID</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, index) =>
              <tr
                key={user.userId ?? user.wcaId}
                className={`hover:bg-table-hover ${index % 2 === 0 ? "bg-table-odd" : "bg-table-even"}`}
              >
                <td>{user.name}</td>
                <td>{user.userId ?? "Ingen NKF ID"}</td>
                <td>{user.wcaId ?? "Ingen WCA ID"}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pageCount > 1 &&
        <div className="flex items-center gap-6 self-center mt-2">
          <Button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="secondary"
            size="sm"
          >
            Forrige
          </Button>
          <span className="text-sm">
            Side {page} av {pageCount}
          </span>
          <Button
            onClick={() => setPage(p => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            variant="secondary"
            size="sm"
          >
            Neste
          </Button>
        </div>
      }
    </div>
  );
}
