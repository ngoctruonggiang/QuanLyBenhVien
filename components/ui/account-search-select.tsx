"use client";

import { useState, useEffect } from "react";
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
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountSearchSelectProps {
  value: string | null;
  onChange: (accountId: string | null) => void;
  /** Called when an account is selected, provides full account info for auto-filling other fields */
  onAccountSelect?: (account: Account | null) => void;
  disabled?: boolean;
  /** Filter accounts by role (e.g., "PATIENT" for receptionist use) */
  roleFilter?: string;
  /** Exclude accounts with these roles (e.g., ["PATIENT", "ADMIN"] for employee linking) */
  excludeRoles?: string[];
}

export function AccountSearchSelect({
  value,
  onChange,
  onAccountSelect,
  disabled,
  roleFilter,
  excludeRoles,
}: AccountSearchSelectProps) {
  const [search, setSearch] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ["accounts", { search: debouncedSearch, roleFilter, excludeRoles }],
    queryFn: () => authService.getAccounts(debouncedSearch, roleFilter, excludeRoles),
    enabled: debouncedSearch.length > 0,
  });

  const accounts = data?.content ?? [];

  // Fetch account by ID when component mounts with existing value but no cached account
  useEffect(() => {
    async function fetchAccountById() {
      if (value && !selectedAccount) {
        try {
          const account = await authService.getAccount(value);
          if (account) {
            setSelectedAccount(account);
          }
        } catch (error) {
          console.error("[AccountSearchSelect] Error fetching account by ID:", error);
        }
      }
    }
    fetchAccountById();
  }, [value]); // Only run when value changes

  // Update cached selected account when found in search results
  useEffect(() => {
    if (value && accounts.length > 0) {
      const found = accounts.find(a => a.id === value);
      if (found) {
        setSelectedAccount(found);
      }
    }
  }, [value, accounts]);

  const handleSelectAccount = (account: Account) => {
    const isDeselect = account.id === value;
    const newValue = isDeselect ? null : account.id;
    const selectedAcc = isDeselect ? null : account;
    
    onChange(newValue);
    setSelectedAccount(selectedAcc);
    onAccountSelect?.(selectedAcc);
  };

  // Get display text for selected account
  const getSelectedDisplayText = () => {
    if (selectedAccount) {
      return selectedAccount.email;
    }
    // Try to find in current results
    const found = accounts.find(a => a.id === value);
    if (found) {
      return found.email;
    }
    // Fallback to showing accountId (this means account was selected but not in cache)
    return value;
  };

  return (
    <div className="space-y-2">
      {/* Show selected account if any */}
      {value && (
        <div className="flex items-center justify-between p-2 bg-sky-50 border border-sky-200 rounded-md">
          <span className="text-sm text-sky-700">
            Selected: <span className="font-medium">{getSelectedDisplayText()}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setSelectedAccount(null);
              onAccountSelect?.(null);
            }}
            className="text-xs text-sky-600 hover:underline"
          >
            Clear
          </button>
        </div>
      )}
      
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
              value={account.email} // Use email for keyboard navigation
              onSelect={() => handleSelectAccount(account)}
              className="cursor-pointer"
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === account.id ? "opacity-100 text-sky-500" : "opacity-0"
                )}
              />
              <div className="flex flex-col">
                <span className="font-medium">{account.email}</span>
                <span className="text-xs text-muted-foreground">
                  Role: {account.role}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  );
}
