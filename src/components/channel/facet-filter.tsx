import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export function FacetFilter({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: FacetOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const toggle = (value: string) =>
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        {label}
        {selected.length > 0 && (
          <Badge variant="secondary">{selected.length}</Badge>
        )}
        <IconChevronDown />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <Command>
          <CommandInput placeholder={`Search ${label.toLowerCase()}…`} />
          <CommandList className="scroll-fade-y">
            <CommandEmpty>Nothing found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => toggle(option.value)}
                >
                  <span className="flex-1 truncate">{option.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {option.count}
                  </span>
                  {selected.includes(option.value) && <IconCheck />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
