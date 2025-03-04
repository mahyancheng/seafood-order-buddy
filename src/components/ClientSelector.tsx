
import React, { useState } from "react";
import { useOrder } from "@/context/OrderContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ClientSelector: React.FC = () => {
  const { clients, selectClient, selectedClient } = useOrder();
  const [open, setOpen] = useState(false);

  return (
    <Card className="w-full animate-slide-up">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Select Client
        </CardTitle>
        <CardDescription>
          Choose a client to create an order for
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedClient
                ? selectedClient.name
                : "Select a client..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search clients..." />
              <CommandEmpty>No client found.</CommandEmpty>
              <CommandGroup>
                <CommandList>
                  {clients.map((client) => (
                    <CommandItem
                      key={client.id}
                      onSelect={() => {
                        selectClient(client.id);
                        setOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedClient?.id === client.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{client.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {client.contactPerson}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
};

export default ClientSelector;
