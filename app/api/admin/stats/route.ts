import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Get all stats in parallel
    const [
      totalUsers,
      totalDrivers,
      totalOrders,
      totalRevenue,
      pendingDocuments,
      activeOrders,
      completedOrders,
      averageRating,
      recentOrders,
      topDrivers,
      revenueByDay,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total drivers
      prisma.driver.count(),

      // Total orders
      prisma.order.count(),

      // Total revenue (sum of all delivered orders)
      prisma.order.aggregate({
        where: { status: "DELIVERED" },
        _sum: { totalPrice: true },
      }),

      // Pending documents
      prisma.document.count({
        where: { status: "PENDING" },
      }),

      // Active orders
      prisma.order.count({
        where: {
          status: {
            in: ["PENDING", "ACCEPTED", "PICKED_UP", "IN_TRANSIT"],
          },
        },
      }),

      // Completed orders
      prisma.order.count({
        where: { status: "DELIVERED" },
      }),

      // Average rating
      prisma.rating.aggregate({
        _avg: { rating: true },
      }),

      // Recent orders (last 10)
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: { name: true, email: true },
          },
          driver: {
            select: { name: true, email: true },
          },
        },
      }),

      // Top drivers by deliveries
      prisma.driver.findMany({
        take: 5,
        orderBy: { totalDeliveries: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),

      // Revenue by day (last 30 days)
      prisma.$queryRaw`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as orders,
          SUM(total_price) as revenue,
          SUM(commission) as commission
        FROM "Order"
        WHERE status = 'DELIVERED'
          AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `,
    ]);

    // Calculate metrics
    const totalCustomers = totalUsers - totalDrivers;
    const commission = totalRevenue._sum.totalPrice
      ? totalRevenue._sum.totalPrice * 0.15
      : 0;
    const conversionRate =
      totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    return NextResponse.json({
      overview: {
        totalUsers,
        totalCustomers,
        totalDrivers,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        commission,
        pendingDocuments,
        activeOrders,
        completedOrders,
        averageRating: averageRating._avg.rating || 0,
        conversionRate,
      },
      recentOrders,
      topDrivers,
      revenueByDay,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
