"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/useDebounce";
import { authService, Account } from "@/services/auth.service";

interface AccountSearchSelectProps {
  value: string | null;
  onChange: (accountId: string | null) => void;
  disabled?: boolean;
}

export function AccountSearchSelect({
  value,
  onChange,
  disabled,
}: AccountSearchSelectProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ["accounts", { search: debouncedSearch }],
    queryFn: () => authService.getAccounts(debouncedSearch),
    enabled: debouncedSearch.length > 0,
  });

  const accounts = data?.content ?? [];
  const selectedAccount = accounts.find((acc) => acc.id === value);

  return (
    <Command
      filter={() => {
        // Disable default filtering, we use server-side search
        return 1;
      }}
    >
      <CommandInput
        placeholder="Search by email..."
        value={search}
        onValueChange={setSearch}
        disabled={disabled}
      />
      <CommandList>
        <CommandEmpty>
          {isLoading
            ? "Searching..."
            : debouncedSearch && accounts.length === 0
            ? "No accounts found."
            : "Type to search for an account."}
        </CommandEmpty>

        {accounts.map((account) => (
          <CommandItem
            key={account.id}
            value={account.id}
            onSelect={(currentValue) => {
              onChange(currentValue === value ? null : currentValue);
            }}
          >
            <div className="flex flex-col">
              <span className="font-medium">{account.email}</span>
              <span className="text-xs text-muted-foreground">
                ID: {account.id} | Role: {account.role}
              </span>
            </div>
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  );
}
