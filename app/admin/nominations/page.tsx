// app/admin/nominations/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { NominationsList } from "./components/NominationsList";

export default function NominationsAdminPage() {
  return (
    <div className='container mx-auto py-8'>
      <Card className='border-0 shadow-none'>
        <CardHeader>
          <CardTitle className='text-2xl'>Nominations Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <NominationsList />
        </CardContent>
      </Card>
    </div>
  );
}
