import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserBehavior from '@/models/UserBehavior';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Aggregate events by day
    const eventsByDay = await UserBehavior.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          total: { $sum: 1 },
          views: {
            $sum: {
              $cond: [{ $regexMatch: { input: '$event', regex: /VIEW/ } }, 1, 0]
            }
          },
          carts: {
            $sum: {
              $cond: [{ $regexMatch: { input: '$event', regex: /CART/ } }, 1, 0]
            }
          },
          searches: {
            $sum: {
              $cond: [{ $regexMatch: { input: '$event', regex: /SEARCH/ } }, 1, 0]
            }
          },
          orders: {
            $sum: {
              $cond: [{ $regexMatch: { input: '$event', regex: /ORDER/ } }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Format data for chart
    const chartData = eventsByDay.map(day => ({
      date: day._id,
      total: day.total,
      views: day.views,
      carts: day.carts,
      searches: day.searches,
      orders: day.orders
    }));

    return NextResponse.json({ data: chartData });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Timeline API error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch timeline' },
      { status: 500 }
    );
  }
}
