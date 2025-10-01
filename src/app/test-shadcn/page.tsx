import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestPage() {
  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Shadcn/UI Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button>Click me!</Button>
        </CardContent>
      </Card>
    </div>
  );
}