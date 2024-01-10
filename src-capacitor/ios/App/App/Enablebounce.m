//
//  Enablebounce.m
//  KifKaf
//
//  Created by jules douet on 09/01/2024.
//
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@implementation UIScrollView (NoBounce)
- (void)didMoveToWindow {
   [super didMoveToWindow];
   self.bounces = YES;
}
@end
